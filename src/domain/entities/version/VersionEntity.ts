type AppEnvironment = "DEVELOPMENT" | "PRODUCTION" | "STAGING";

type ChangelogSectionType =
  | "ADDED"
  | "CHANGED"
  | "FIXED"
  | "REMOVED"
  | "SECURITY";

interface ReleaseEntity {
  publishedAt: string;
  sections: { items: string[]; type: ChangelogSectionType }[];
  url: string;
  version: string;
}

interface VersionEntity {
  api: {
    builtAt: null | string;
    current: string;
    latest: null | string;
    latestUrl: null | string;
    releasedAt: null | string;
    releases: ReleaseEntity[];
    startedAt: string;
    updateAvailable: boolean;
  };
  app: {
    latest: null | string;
    latestUrl: null | string;
    releases: ReleaseEntity[];
  };
  checkedAt: null | string;
  environment: AppEnvironment;
}

export type {
  AppEnvironment,
  ChangelogSectionType,
  ReleaseEntity,
  VersionEntity,
};
