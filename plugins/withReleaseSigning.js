const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "// lp-release-signing";

const RELEASE_SIGNING_CONFIG = `signingConfigs {
        release {
            ${MARKER}
            def required = ['LP_RELEASE_STORE_FILE', 'LP_RELEASE_STORE_PASSWORD', 'LP_RELEASE_KEY_ALIAS', 'LP_RELEASE_KEY_PASSWORD']
            def missing = required.findAll { !findProperty(it) }
            if (missing && gradle.startParameter.taskNames.any { it.toLowerCase().contains('release') }) {
                throw new GradleException("Missing Gradle properties for release signing: \${missing.join(', ')}")
            }
            if (!missing) {
                storeFile file(findProperty('LP_RELEASE_STORE_FILE'))
                storePassword findProperty('LP_RELEASE_STORE_PASSWORD')
                keyAlias findProperty('LP_RELEASE_KEY_ALIAS')
                keyPassword findProperty('LP_RELEASE_KEY_PASSWORD')
            }
        }`;

const SIGNING_CONFIGS_ANCHOR = /signingConfigs\s*\{/;
const RELEASE_BUILD_TYPE_ANCHOR =
  /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;

// Expo's prebuild signs the release build type with the debug key. Replace it with a
// release config fed by Gradle properties, and fail loudly if the template ever changes.
function applyReleaseSigning(gradle) {
  if (gradle.includes(MARKER)) {
    return gradle;
  }

  if (
    !SIGNING_CONFIGS_ANCHOR.test(gradle) ||
    !RELEASE_BUILD_TYPE_ANCHOR.test(gradle)
  ) {
    throw new Error(
      "withReleaseSigning: could not find the release signing anchors in android/app/build.gradle",
    );
  }

  return gradle
    .replace(SIGNING_CONFIGS_ANCHOR, () => RELEASE_SIGNING_CONFIG)
    .replace(
      RELEASE_BUILD_TYPE_ANCHOR,
      (_match, before) => `${before}signingConfig signingConfigs.release`,
    );
}

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = applyReleaseSigning(
      modConfig.modResults.contents,
    );
    return modConfig;
  });
}

module.exports = withReleaseSigning;
module.exports.applyReleaseSigning = applyReleaseSigning;
