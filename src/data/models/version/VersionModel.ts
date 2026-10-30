import {
  AppEnvironment,
  ChangelogSectionType,
  ReleaseEntity,
  VersionEntity,
} from "@domain/entities/version/VersionEntity";

type Json = Record<string, unknown>;

const SECTION_TYPES: ChangelogSectionType[] = [
  "ADDED",
  "CHANGED",
  "FIXED",
  "REMOVED",
  "SECURITY",
];
const ENVIRONMENTS: AppEnvironment[] = ["DEVELOPMENT", "PRODUCTION", "STAGING"];

// API shape of `GET /v1/version` (spec 056). Tolerant: missing lists become empty.
class VersionModel {
  static fromJSON(data: Json): VersionEntity {
    const api = (data.api ?? {}) as Json;
    const app = (data.app ?? {}) as Json;

    return {
      api: {
        builtAt: text(api.builtAt),
        current: String(api.current ?? "0.0.0"),
        latest: text(api.latest),
        latestUrl: text(api.latestUrl),
        releasedAt: text(api.releasedAt),
        releases: releases(api.releases),
        startedAt: String(api.startedAt ?? ""),
        updateAvailable: api.updateAvailable === true,
      },
      app: {
        latest: text(app.latest),
        latestUrl: text(app.latestUrl),
        releases: releases(app.releases),
      },
      checkedAt: text(data.checkedAt),
      environment: ENVIRONMENTS.includes(data.environment as AppEnvironment)
        ? (data.environment as AppEnvironment)
        : "DEVELOPMENT",
    };
  }
}

function releases(value: unknown): ReleaseEntity[] {
  return (Array.isArray(value) ? (value as Json[]) : []).map((release) => ({
    publishedAt: String(release.publishedAt ?? ""),
    sections: (Array.isArray(release.sections)
      ? (release.sections as Json[])
      : []
    ).map((section) => ({
      items: Array.isArray(section.items) ? section.items.map(String) : [],
      type: SECTION_TYPES.includes(section.type as ChangelogSectionType)
        ? (section.type as ChangelogSectionType)
        : "CHANGED",
    })),
    url: String(release.url ?? ""),
    version: String(release.version ?? ""),
  }));
}

function text(value: unknown): null | string {
  return typeof value === "string" ? value : null;
}

export default VersionModel;
