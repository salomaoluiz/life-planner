#!/usr/bin/env bash
# Builds the signed production APK locally (no store). See README "Production".
# Needs .env.production (git-ignored) and the release keystore properties in
# ~/.gradle/gradle.properties: LP_RELEASE_STORE_FILE, LP_RELEASE_STORE_PASSWORD,
# LP_RELEASE_KEY_ALIAS, LP_RELEASE_KEY_PASSWORD.
set -euo pipefail

cd "$(dirname "$0")/.."

fail() {
  echo "build:android:prod: $1" >&2
  exit 1
}

[ -f .env.production ] || fail ".env.production not found. Create it from .env.example with the production values."

API_URL="$( (grep -E '^EXPO_PUBLIC_API_URL=' .env.production || true) | tail -n 1 | cut -d= -f2- | tr -d "\"' \r")"
[ -n "$API_URL" ] || fail "EXPO_PUBLIC_API_URL is missing in .env.production."
case "$API_URL" in
  https://*) ;;
  *) fail "EXPO_PUBLIC_API_URL in .env.production must start with https:// (got: $API_URL)." ;;
esac
case "$API_URL" in
  *localhost* | *127.0.0.1* | *your-*) fail "EXPO_PUBLIC_API_URL in .env.production still points at a local or placeholder host ($API_URL)." ;;
esac

GRADLE_PROPERTIES="${GRADLE_USER_HOME:-$HOME/.gradle}/gradle.properties"
[ -f "$GRADLE_PROPERTIES" ] || fail "$GRADLE_PROPERTIES not found. Add the LP_RELEASE_* keystore properties (see README)."
for key in LP_RELEASE_STORE_FILE LP_RELEASE_STORE_PASSWORD LP_RELEASE_KEY_ALIAS LP_RELEASE_KEY_PASSWORD; do
  grep -Eq "^${key}=.+" "$GRADLE_PROPERTIES" || fail "$key is missing in $GRADLE_PROPERTIES."
done

STORE_FILE="$(grep -E '^LP_RELEASE_STORE_FILE=' "$GRADLE_PROPERTIES" | tail -n 1 | cut -d= -f2-)"
STORE_FILE="${STORE_FILE/#\~/$HOME}"
[ -f "$STORE_FILE" ] || fail "Keystore file not found: $STORE_FILE."

NODE_ENV=production npx expo prebuild --clean -p android
(cd android && ./gradlew assembleRelease)

APK="android/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK" ] || fail "Gradle finished but $APK was not produced."
echo "APK: $APK"
if command -v apksigner >/dev/null 2>&1; then
  apksigner verify --print-certs "$APK" | head -n 3
fi
