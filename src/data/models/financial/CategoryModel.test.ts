import CategoryModel from "./CategoryModel";
import { mocks, setup } from "./mocks/CategoryModel.mocks";

it("SHOULD the CategoryModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("depthLevel", mocks.json.depthLevel);
  expect(result).toHaveProperty("icon", mocks.json.icon);
  expect(result).toHaveProperty("iconColor", mocks.json.iconColor);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.ownerId);
  expect(result).toHaveProperty("parentId", mocks.json.parentId);
  expect(result).toHaveProperty("type", mocks.json.type);
});

it("SHOULD fromJSON read the API camelCase JSON", () => {
  const modelFromJson = CategoryModel.fromJSON({
    ...mocks.json,
    createdAt: "2026-10-04T12:00:00.000Z",
    updatedAt: "2026-10-04T12:00:00.000Z",
  });

  expect(modelFromJson).toStrictEqual(setup());
});

it("SHOULD toJSON return the API shape", () => {
  expect(setup().toJSON()).toStrictEqual(mocks.json);
});

it("SHOULD map the API default color #000000 to the black token AND back", () => {
  const model = CategoryModel.fromJSON({ ...mocks.json, iconColor: "#000000" });

  expect(model.iconColor).toBe("black");
  expect(model.toJSON().iconColor).toBe("#000000");
});

it("SHOULD treat a null parentId (root) as undefined AND write it back as null", () => {
  const model = CategoryModel.fromJSON({
    ...mocks.json,
    depthLevel: 0,
    parentId: null,
  });

  expect(model.parentId).toBeUndefined();
  expect(model.toJSON().parentId).toBeNull();
});

it("SHOULD apply defaults WHEN the optional JSON fields are missing", () => {
  const model = CategoryModel.fromJSON({
    icon: mocks.json.icon,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    ownerId: mocks.json.ownerId,
  });

  expect(model.iconColor).toBe("black");
  expect(model.type).toBe("EXPENSE");
  expect(model.depthLevel).toBeUndefined();
  expect(model.parentId).toBeUndefined();
});

it("SHOULD treat a null depth level as undefined AND convert a numeric one", () => {
  expect(
    CategoryModel.fromJSON({ ...mocks.json, depthLevel: null }).depthLevel,
  ).toBeUndefined();
  expect(
    CategoryModel.fromJSON({ ...mocks.json, depthLevel: "2" }).depthLevel,
  ).toBe(2);
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

it("SHOULD round-trip toJSON and fromJSON (repository cache)", () => {
  const model = setup();

  expect(CategoryModel.fromJSON(model.toJSON())).toStrictEqual(model);
});
