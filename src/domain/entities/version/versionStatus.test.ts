import { VersionEntity } from "./VersionEntity";
import {
  isNewerVersion,
  newerReleases,
  resolveVersionStatus,
  ResolveVersionStatusInput,
} from "./versionStatus";

function info(overrides: {
  apiLatest?: null | string;
  appLatest?: null | string;
  updateAvailable?: boolean;
}): VersionEntity {
  const {
    apiLatest = "1.13.0",
    appLatest = "1.5.0",
    updateAvailable = false,
  } = overrides;

  return {
    api: {
      builtAt: null,
      current: "1.13.0",
      latest: apiLatest,
      latestUrl: apiLatest ? "https://example.com/api" : null,
      releasedAt: null,
      releases: [],
      startedAt: "",
      updateAvailable,
    },
    app: {
      latest: appLatest,
      latestUrl: appLatest ? "https://example.com/app" : null,
      releases: [],
    },
    checkedAt: null,
    environment: "PRODUCTION",
  };
}

function resolve(overrides: Partial<ResolveVersionStatusInput> = {}) {
  return resolveVersionStatus({
    appBuiltAt: "2026-10-28T18:12:00Z",
    appVersion: "1.5.0",
    info: info({}),
    infoFailed: false,
    platform: "web",
    served: { builtAt: "2026-10-28T18:12:00Z", version: "1.5.0" },
    ...overrides,
  });
}

describe("isNewerVersion", () => {
  it("SHOULD compare numerically AND ignore invalid versions", () => {
    expect(isNewerVersion("1.10.0", "1.9.0")).toBe(true);
    expect(isNewerVersion("1.0.0", "1.0.0")).toBe(false);
    expect(isNewerVersion("v2.0.0", "1.9.9")).toBe(true);
    expect(isNewerVersion(null, "1.0.0")).toBe(false);
    expect(isNewerVersion("junk", "1.0.0")).toBe(false);
  });
});

describe("newerReleases", () => {
  it("SHOULD keep only the releases newer than the running version", () => {
    const releases = ["1.14.0", "1.13.0", "1.12.0"].map((version) => ({
      publishedAt: "",
      sections: [],
      url: "",
      version,
    }));

    expect(newerReleases(releases, "1.12.0").map((r) => r.version)).toEqual([
      "1.14.0",
      "1.13.0",
    ]);
  });
});

describe("resolveVersionStatus", () => {
  it("SHOULD be all up to date with no banner WHEN everything matches", () => {
    expect(resolve()).toEqual({
      api: "UP_TO_DATE",
      app: "UP_TO_DATE",
      banner: null,
      updates: 0,
    });
  });

  it("SHOULD ask to reload WHEN the served web version is newer", () => {
    const status = resolve({
      served: { builtAt: "2026-10-30T09:00:00Z", version: "1.6.0" },
    });

    expect(status.app).toBe("RELOAD");
    expect(status.banner).toEqual({
      current: "1.5.0",
      kind: "RELOAD",
      url: null,
      version: "1.6.0",
    });
    expect(status.updates).toBe(1);
  });

  it("SHOULD ask to reload WHEN the same version was rebuilt later", () => {
    expect(
      resolve({
        served: { builtAt: "2026-10-30T09:00:00Z", version: "1.5.0" },
      }).app,
    ).toBe("RELOAD");
  });

  it("SHOULD NOT ask to reload WHEN version.json is unknown", () => {
    expect(resolve({ served: null }).banner).toBeNull();
  });

  it("SHOULD NOT ask to reload WHEN the running build time is unknown AND versions match", () => {
    expect(
      resolve({
        appBuiltAt: null,
        served: { builtAt: "2026-10-30T09:00:00Z", version: "1.5.0" },
      }).app,
    ).toBe("UP_TO_DATE");
  });

  it("SHOULD flag a pending web deploy WITHOUT a banner", () => {
    const status = resolve({ info: info({ appLatest: "1.6.0" }) });

    expect(status).toMatchObject({
      app: "DEPLOY_PENDING",
      banner: null,
      updates: 1,
    });
  });

  it("SHOULD compare the latest with the running version WHEN the web served version is unknown", () => {
    expect(
      resolve({ info: info({ appLatest: "1.6.0" }), served: null }).app,
    ).toBe("DEPLOY_PENDING");
  });

  it("SHOULD show the APK banner WHEN Android runs an older version", () => {
    const status = resolve({
      appVersion: "1.4.0",
      info: info({ appLatest: "1.5.0" }),
      platform: "android",
      served: null,
    });

    expect(status.app).toBe("APK_BEHIND");
    expect(status.banner).toEqual({
      current: "1.4.0",
      kind: "APK",
      url: "https://example.com/app",
      version: "1.5.0",
    });
  });

  it("SHOULD be up to date on Android WHEN the APK is current", () => {
    expect(resolve({ platform: "android", served: null }).app).toBe(
      "UP_TO_DATE",
    );
  });

  it("SHOULD never show a banner on iOS", () => {
    expect(
      resolve({
        appVersion: "1.0.0",
        platform: "ios",
        served: null,
      }),
    ).toMatchObject({ app: "UP_TO_DATE", banner: null });
  });

  it("SHOULD flag a pending API deploy WITHOUT a banner AND count it", () => {
    const status = resolve({
      info: info({ apiLatest: "1.14.0", updateAvailable: true }),
    });

    expect(status).toMatchObject({
      api: "DEPLOY_PENDING",
      banner: null,
      updates: 1,
    });
  });

  it("SHOULD count both services WHEN both are behind", () => {
    expect(
      resolve({
        info: info({ appLatest: "1.6.0", updateAvailable: true }),
      }).updates,
    ).toBe(2);
  });

  it("SHOULD be unknown WHEN GitHub could not be checked", () => {
    expect(
      resolve({ info: info({ apiLatest: null, appLatest: null }) }),
    ).toEqual({ api: "UNKNOWN", app: "UNKNOWN", banner: null, updates: 0 });
  });

  it("SHOULD be unknown while the first answer is loading", () => {
    expect(resolve({ info: null })).toMatchObject({
      api: "UNKNOWN",
      app: "UNKNOWN",
      updates: 0,
    });
  });

  it("SHOULD report the API as unavailable WHEN the request failed", () => {
    expect(resolve({ info: null, infoFailed: true })).toMatchObject({
      api: "UNAVAILABLE",
      updates: 0,
    });
  });

  it("SHOULD still ask to reload WHEN the API is unavailable but version.json is newer", () => {
    expect(
      resolve({
        info: null,
        infoFailed: true,
        served: { builtAt: "2026-10-30T09:00:00Z", version: "1.6.0" },
      }),
    ).toMatchObject({ api: "UNAVAILABLE", app: "RELOAD", updates: 1 });
  });
});

describe("resolveVersionStatus web reload banner (spec 057)", () => {
  it("SHOULD show no banner WHEN the served build is the same instant", () => {
    const result = resolve();

    expect(result.banner).toBeNull();
    expect(result.app).not.toBe("RELOAD");
  });

  it("SHOULD reload WHEN the served builtAt is later with the same version", () => {
    const result = resolve({
      served: { builtAt: "2026-10-29T10:00:00Z", version: "1.5.0" },
    });

    expect(result.app).toBe("RELOAD");
  });

  it("SHOULD reload WHEN the served version is newer", () => {
    const result = resolve({
      served: { builtAt: "2026-10-28T18:12:00Z", version: "1.6.0" },
    });

    expect(result.app).toBe("RELOAD");
  });

  it("SHOULD show no banner WHEN the served builtAt is earlier", () => {
    const result = resolve({
      served: { builtAt: "2026-10-27T10:00:00Z", version: "1.5.0" },
    });

    expect(result.banner).toBeNull();
  });

  it("SHOULD show no banner WHEN nothing is served", () => {
    expect(resolve({ served: null }).banner).toBeNull();
  });
});
