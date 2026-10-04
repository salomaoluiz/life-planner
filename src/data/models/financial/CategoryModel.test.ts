import CategoryModel from "./CategoryModel";
import { mocks, setup } from "./mocks/CategoryModel.mocks";

it("SHOULD the CategoryModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("depthLevel", mocks.json.depth_level);
  expect(result).toHaveProperty("icon", mocks.json.icon);
  expect(result).toHaveProperty("iconColor", mocks.json.icon_color);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.owner_id);
  expect(result).toHaveProperty("parentId", mocks.json.parent_id);
  expect(result).toHaveProperty("type", mocks.json.type);
});

it("SHOULD the CategoryModel fromJson create a new CategoryModel", () => {
  const modelFromJson = CategoryModel.fromJSON({
    depth_level: mocks.json.depth_level,
    icon: mocks.json.icon,
    icon_color: mocks.json.icon_color,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    parent_id: mocks.json.parent_id,
    type: mocks.json.type,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the CategoryModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});

it("SHOULD apply defaults WHEN the optional JSON fields are missing", () => {
  const model = CategoryModel.fromJSON({
    icon: mocks.json.icon,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
  });

  expect(model.iconColor).toBe("black");
  expect(model.type).toBe("EXPENSE");
  expect(model.depthLevel).toBeUndefined();
  expect(model.parentId).toBeUndefined();
});

it("SHOULD treat null depth level and parent id as undefined", () => {
  const model = CategoryModel.fromJSON({
    depth_level: null,
    icon: mocks.json.icon,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    parent_id: null,
  });

  expect(model.depthLevel).toBeUndefined();
  expect(model.parentId).toBeUndefined();
});

it("SHOULD convert a numeric depth level and a parent id from JSON", () => {
  const model = CategoryModel.fromJSON({
    depth_level: "2",
    icon: mocks.json.icon,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    parent_id: 7,
  });

  expect(model.depthLevel).toBe(2);
  expect(model.parentId).toBe("7");
});

it("SHOULD default the icon color to black WHEN the constructor receives none", () => {
  const model = new CategoryModel({
    icon: "food",
    id: "cat-1",
    name: "Food",
    owner: mocks.json.owner,
    ownerId: "owner-1",
    type: "EXPENSE",
  } as ConstructorParameters<typeof CategoryModel>[0]);

  expect(model.iconColor).toBe("black");
});
