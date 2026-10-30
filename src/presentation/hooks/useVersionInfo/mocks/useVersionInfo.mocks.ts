import { VersionEntity } from "@domain/entities/version/VersionEntity";
import { VersionStatus } from "@domain/entities/version/versionStatus";

import { UseVersionInfoResponse } from "../";

const info: VersionEntity = {
  api: {
    builtAt: "2026-10-27T21:40:00Z",
    current: "1.12.0",
    latest: "1.12.0",
    latestUrl: "https://example.com/api/releases/tag/v1.12.0",
    releasedAt: "2026-10-27",
    releases: [],
    startedAt: "2026-10-27T21:44:00Z",
    updateAvailable: false,
  },
  app: { latest: "1.4.0", latestUrl: "https://example.com/app", releases: [] },
  checkedAt: "2026-10-30T09:58:00Z",
  environment: "PRODUCTION",
};

const upToDate: VersionStatus = {
  api: "UP_TO_DATE",
  app: "UP_TO_DATE",
  banner: null,
  updates: 0,
};

function versionInfo(
  overrides: Partial<UseVersionInfoResponse> = {},
): UseVersionInfoResponse {
  return {
    appBuiltAt: "2026-10-28T18:12:00Z",
    banner: null,
    checkedAt: info.checkedAt,
    checkNow: jest.fn().mockResolvedValue(undefined),
    dismiss: jest.fn(),
    info,
    isChecking: false,
    platform: "web",
    runningVersion: "1.4.0",
    servedVersion: "1.4.0",
    status: upToDate,
    ...overrides,
  };
}

export { info, upToDate, versionInfo };
