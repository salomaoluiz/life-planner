import FamilyModel from "./FamilyModel";
import { mocks, setup } from "./mocks/FamilyModel.mocks";

it("SHOULD the FamilyModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("ownerId", mocks.json.owner_id);
});

it("SHOULD the FamilyModel fromJson create a new FamilyModel", () => {
  const modelFromJson = FamilyModel.fromJSON({
    id: mocks.json.id,
    name: mocks.json.name,
    owner_id: mocks.json.owner_id,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the FamilyModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
