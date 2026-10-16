import { applyReleaseSigning } from "./withReleaseSigning";

const GRADLE = `android {
    defaultConfig {
        versionCode 1
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
        }
    }
}
`;

const PROPERTIES = [
  "LP_RELEASE_STORE_FILE",
  "LP_RELEASE_STORE_PASSWORD",
  "LP_RELEASE_KEY_ALIAS",
  "LP_RELEASE_KEY_PASSWORD",
];

function releaseBuildType(gradle: string) {
  return gradle.slice(gradle.indexOf("buildTypes"));
}

describe("GIVEN applyReleaseSigning", () => {
  it("SHOULD declare a release signing config reading the four LP_RELEASE_* properties", () => {
    const result = applyReleaseSigning(GRADLE);

    PROPERTIES.forEach((property) => expect(result).toContain(property));
    expect(result).toMatch(/signingConfigs\s*\{\s*release\s*\{/);
  });

  it("SHOULD sign the release build type with the release config, not the debug key", () => {
    const release = releaseBuildType(applyReleaseSigning(GRADLE));
    const releaseBlock = release.slice(release.indexOf("release {"));

    expect(releaseBlock).toContain("signingConfig signingConfigs.release");
    expect(releaseBlock).not.toContain("signingConfig signingConfigs.debug");
  });

  it("SHOULD keep the debug build type signed with the debug key", () => {
    const result = applyReleaseSigning(GRADLE);
    const debugBlock = result.slice(
      result.indexOf("buildTypes"),
      result.indexOf("release {", result.indexOf("buildTypes")),
    );

    expect(debugBlock).toContain("signingConfig signingConfigs.debug");
  });

  it("SHOULD fail the Gradle build for release tasks WHEN a property is missing", () => {
    const result = applyReleaseSigning(GRADLE);

    expect(result).toContain("GradleException");
    expect(result).toContain("startParameter.taskNames");
  });

  it("SHOULD be idempotent", () => {
    const once = applyReleaseSigning(GRADLE);

    expect(applyReleaseSigning(once)).toBe(once);
  });

  it("SHOULD throw WHEN the expected gradle anchors are missing", () => {
    expect(() => applyReleaseSigning("android { }")).toThrow(
      /release signing/i,
    );
  });
});
