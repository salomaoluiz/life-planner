import { VersionStatus } from "@domain/entities/version/versionStatus";

import { environmentKey, statusChip } from "./labels";

function status(overrides: Partial<VersionStatus>): VersionStatus {
  return {
    api: "UP_TO_DATE",
    app: "UP_TO_DATE",
    banner: null,
    updates: 0,
    ...overrides,
  };
}

it("SHOULD map every environment to its key", () => {
  expect(environmentKey("PRODUCTION")).toBe("versions.env.production");
  expect(environmentKey("STAGING")).toBe("versions.env.staging");
  expect(environmentKey("DEVELOPMENT")).toBe("versions.env.development");
});

describe("statusChip", () => {
  it("SHOULD be up to date WHEN nothing is pending", () => {
    expect(statusChip(status({}))).toEqual({
      key: "versions.status.upToDate",
      tone: "income",
    });
  });

  it("SHOULD count the pending updates with singular and plural keys", () => {
    expect(statusChip(status({ updates: 1 }))).toEqual({
      count: 1,
      key: "versions.status.updates_one",
      tone: "warning",
    });
    expect(statusChip(status({ updates: 2 }))).toMatchObject({
      count: 2,
      key: "versions.status.updates_other",
    });
  });

  it("SHOULD be unknown WHEN either service could not be checked", () => {
    expect(statusChip(status({ app: "UNKNOWN" })).key).toBe(
      "versions.status.unknown",
    );
    expect(statusChip(status({ api: "UNKNOWN" })).tone).toBe("neutral");
  });

  it("SHOULD say the API is down before anything else", () => {
    expect(statusChip(status({ api: "UNAVAILABLE", updates: 1 }))).toEqual({
      key: "versions.status.apiDown",
      tone: "expense",
    });
  });
});
