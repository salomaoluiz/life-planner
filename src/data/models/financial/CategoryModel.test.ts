import CategoryModel from "./CategoryModel";
import { mocks, setup } from "./mocks/CategoryModel.mocks";

it("SHOULD the CategoryModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("icon", mocks.json.icon);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.owner_id);
  expect(result).toHaveProperty("parentId", mocks.json.parent_id);
  expect(result).toHaveProperty("depthLevel", mocks.json.depth_level);
});

it("SHOULD the CategoryModel fromJson create a new CategoryModel", () => {
  const modelFromJson = CategoryModel.fromJSON({
    depth_level: mocks.json.depth_level,
    icon: mocks.json.icon,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    parent_id: mocks.json.parent_id,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the CategoryModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
