import FamilyModel from "./FamilyModel";
import { mocks, setup } from "./mocks/FamilyModel.mocks";

it("SHOULD the FamilyModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("ownerId", mocks.json.ownerId);
});

it("SHOULD the FamilyModel fromJson create a new FamilyModel from the API JSON", () => {
  const modelFromJson = FamilyModel.fromJSON({
    createdAt: "2026-10-04T12:00:00.000Z",
    id: mocks.json.id,
    name: mocks.json.name,
    ownerId: mocks.json.ownerId,
    updatedAt: "2026-10-04T12:00:00.000Z",
  });

  expect(modelFromJson).toStrictEqual(setup());
});

it("SHOULD the FamilyModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});

it("SHOULD round-trip toJSON and fromJSON (local cache)", () => {
  const model = setup();

  expect(FamilyModel.fromJSON(model.toJSON())).toStrictEqual(model);
});
