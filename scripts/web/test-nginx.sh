#!/usr/bin/env bash
# Builds the web image and checks SPA fallback, 404s and cache headers on a scratch port.
set -euo pipefail

IMAGE="lp-web:test"
NAME="lp-web-nginx-test"
PORT="${PORT:-18016}"

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker build -f Dockerfile.web --build-arg EXPO_PUBLIC_API_URL=https://example.invalid/api -t "$IMAGE" .
docker run -d --name "$NAME" -p "$PORT:80" "$IMAGE" >/dev/null
sleep 2

code() { curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$1"; }
fail() { echo "FAIL: $1"; exit 1; }

[ "$(code /)" = "200" ] || fail "/ should be 200"
[ "$(code /finances/accounts)" = "200" ] || fail "deep link should be 200"
curl -s "http://localhost:$PORT/finances/accounts" | grep -qi "<html" || fail "deep link should serve index.html"
[ "$(code /_expo/static/js/missing.js)" = "404" ] || fail "missing asset should be 404"
curl -sI "http://localhost:$PORT/index.html" | grep -qi "cache-control: no-cache" || fail "index.html should be no-cache"
docker run --rm "$IMAGE" grep -rl "example.invalid/api" /usr/share/nginx/html >/dev/null || fail "API url was not inlined"

echo OK
