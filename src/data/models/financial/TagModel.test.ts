import TagModel, { tagRefsFromJSON } from "./TagModel";

const json = {
  id: "6f1c0f2e-1111-4a2b-8c3d-000000000001",
  name: "gasto-fixo",
  owner: "USER",
  ownerId: "1b2c0f2e-1111-4a2b-8c3d-000000000002",
  scope: "ALL",
  scopes: [
    { owner: "USER", ownerId: "1b2c0f2e-1111-4a2b-8c3d-000000000002" },
    { owner: "FAMILY", ownerId: "9a8b0f2e-1111-4a2b-8c3d-000000000003" },
  ],
  usageCount: 24,
};

it("SHOULD round-trip the API shape through fromJSON and toJSON", () => {
  expect(TagModel.fromJSON(json).toJSON()).toEqual(json);
});

it("SHOULD default the scope from the owner AND the usage to 0", () => {
  const model = TagModel.fromJSON({
    id: "id",
    name: "viagem",
    owner: "FAMILY",
    ownerId: "fam",
  });

  expect(model.scope).toBe("FAMILY");
  expect(model.scopes).toEqual([{ owner: "FAMILY", ownerId: "fam" }]);
  expect(model.usageCount).toBe(0);
  expect(
    new TagModel({ id: "i", name: "n", owner: "USER", ownerId: "u" }).scope,
  ).toBe("PERSONAL");
});

it("SHOULD read the tags of a transaction, or [] WHEN absent", () => {
  expect(tagRefsFromJSON([{ extra: 1, id: "a", name: "x" }])).toEqual([
    { id: "a", name: "x" },
  ]);
  expect(tagRefsFromJSON(undefined)).toEqual([]);
  expect(tagRefsFromJSON(null)).toEqual([]);
});
