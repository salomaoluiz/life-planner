import { ReleaseEntity, VersionEntity } from "./VersionEntity";

type ApiStatus = "DEPLOY_PENDING" | "UNAVAILABLE" | "UNKNOWN" | "UP_TO_DATE";

type AppStatus =
  | "APK_BEHIND"
  | "DEPLOY_PENDING"
  | "RELOAD"
  | "UNKNOWN"
  | "UP_TO_DATE";

interface ResolveVersionStatusInput {
  appBuiltAt: null | string;
  appVersion: string;
  info: null | VersionEntity;
  infoFailed: boolean;
  platform: "android" | "ios" | "web";
  served: null | { builtAt: string; version: string };
}

interface StatusBanner {
  current: string;
  kind: "APK" | "RELOAD";
  url: null | string;
  version: string;
}

interface VersionStatus {
  api: ApiStatus;
  app: AppStatus;
  banner: null | StatusBanner;
  updates: number;
}

function isNewerVersion(candidate: null | string, base: string): boolean {
  const left = parse(candidate);
  const right = parse(base);

  if (!left || !right) {
    return false;
  }

  return (left[0] - right[0] || left[1] - right[1] || left[2] - right[2]) > 0;
}

// Releases newer than the version that is running, newest first (the API already sorts them).
function newerReleases(
  releases: ReleaseEntity[],
  running: string,
): ReleaseEntity[] {
  return releases.filter((release) => isNewerVersion(release.version, running));
}

function parse(value: null | string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value ?? "");

  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function resolveApiStatus({
  info,
  infoFailed,
}: ResolveVersionStatusInput): ApiStatus {
  if (infoFailed) {
    return "UNAVAILABLE";
  }
  if (!info || info.api.latest === null) {
    return "UNKNOWN";
  }

  return info.api.updateAvailable ? "DEPLOY_PENDING" : "UP_TO_DATE";
}

function resolveAppStatus(input: ResolveVersionStatusInput): {
  banner: null | StatusBanner;
  status: AppStatus;
} {
  const { appBuiltAt, appVersion, info, platform, served } = input;

  // 1. Web: the server already serves a newer bundle than the one in this tab.
  if (platform === "web" && served) {
    const newerBuild =
      served.version === appVersion &&
      appBuiltAt !== null &&
      served.builtAt > appBuiltAt;

    if (isNewerVersion(served.version, appVersion) || newerBuild) {
      return {
        banner: {
          current: appVersion,
          kind: "RELOAD",
          url: null,
          version: served.version,
        },
        status: "RELOAD",
      };
    }
  }

  const latest = info?.app.latest ?? null;

  if (latest === null) {
    return { banner: null, status: "UNKNOWN" };
  }

  // 2. Web: released on GitHub but not deployed yet (nothing the user can do).
  if (platform === "web") {
    const live = served?.version ?? appVersion;

    return {
      banner: null,
      status: isNewerVersion(latest, live) ? "DEPLOY_PENDING" : "UP_TO_DATE",
    };
  }

  // 3. Android: this APK is behind the latest release.
  if (platform === "android" && isNewerVersion(latest, appVersion)) {
    return {
      banner: {
        current: appVersion,
        kind: "APK",
        url: info?.app.latestUrl ?? null,
        version: latest,
      },
      status: "APK_BEHIND",
    };
  }

  return { banner: null, status: "UP_TO_DATE" };
}

function resolveVersionStatus(input: ResolveVersionStatusInput): VersionStatus {
  const api = resolveApiStatus(input);
  const { banner, status: app } = resolveAppStatus(input);
  const updates =
    (api === "DEPLOY_PENDING" ? 1 : 0) +
    (app === "RELOAD" || app === "DEPLOY_PENDING" || app === "APK_BEHIND"
      ? 1
      : 0);

  return { api, app, banner, updates };
}

export type {
  ApiStatus,
  AppStatus,
  ResolveVersionStatusInput,
  StatusBanner,
  VersionStatus,
};
export { isNewerVersion, newerReleases, resolveVersionStatus };
