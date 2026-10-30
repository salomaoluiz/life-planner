import VersionModel from "./VersionModel";

const sample = {
  api: {
    builtAt: "2026-10-27T21:40:00Z",
    current: "1.12.0",
    latest: "1.13.0",
    latestUrl: "https://example.com/releases/tag/v1.13.0",
    releasedAt: "2026-10-27",
    releases: [
      {
        publishedAt: "2026-10-30T09:20:00Z",
        sections: [{ items: ["Added thing."], type: "ADDED" }],
        url: "https://example.com/releases/tag/v1.13.0",
        version: "1.13.0",
      },
    ],
    startedAt: "2026-10-27T21:44:00Z",
    updateAvailable: true,
  },
  app: { latest: "1.5.0", latestUrl: null, releases: [] },
  checkedAt: "2026-10-30T09:58:00Z",
  environment: "STAGING",
};

it("SHOULD map the documented response", () => {
  expect(VersionModel.fromJSON(sample)).toEqual(sample);
});

it("SHOULD tolerate missing lists, unknown sections and unknown environments", () => {
  const entity = VersionModel.fromJSON({
    api: {
      releases: [{ sections: [{ items: ["x"], type: "OTHER" }] }, {}],
    },
    environment: "QA",
  });

  expect(entity.api.releases[0].sections).toEqual([
    { items: ["x"], type: "CHANGED" },
  ]);
  expect(entity.api.releases[1]).toEqual({
    publishedAt: "",
    sections: [],
    url: "",
    version: "",
  });
  expect(entity.api).toMatchObject({
    current: "0.0.0",
    latest: null,
    updateAvailable: false,
  });
  expect(entity.app).toEqual({ latest: null, latestUrl: null, releases: [] });
  expect(entity).toMatchObject({ checkedAt: null, environment: "DEVELOPMENT" });
});

it("SHOULD survive an empty body and a release with non-list sections", () => {
  expect(VersionModel.fromJSON({}).api.releases).toEqual([]);
  expect(
    VersionModel.fromJSON({ api: { releases: [{ sections: "x" }] } }).api
      .releases[0].sections,
  ).toEqual([]);
  expect(
    VersionModel.fromJSON({
      api: { releases: [{ sections: [{ type: "ADDED" }] }] },
    }).api.releases[0].sections,
  ).toEqual([{ items: [], type: "ADDED" }]);
});
