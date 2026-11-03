import { mocks, setup } from "./mocks/UserModel.mocks";
import UserModel from "./UserModel";

it("SHOULD the UserModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("email", mocks.json.email);
  expect(result).toHaveProperty("avatarURL", mocks.json.photoUrl);
});

it("SHOULD the UserModel fromJson create a new UserModel from the API json", () => {
  const modelFromJson = UserModel.fromJSON({ ...mocks.json });

  expect(modelFromJson).toStrictEqual(setup());
});

it.each([
  ["missing", undefined],
  ["null", null],
  ["empty", ""],
])("SHOULD map a %s photoUrl to no avatar", (_label, photoUrl) => {
  const model = UserModel.fromJSON({ ...mocks.json, photoUrl });

  expect(model.avatarURL).toBeUndefined();
});

it("SHOULD the UserModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});

it("SHOULD round-trip through the cache json", () => {
  const model = setup();

  expect(UserModel.fromJSON(model.toJSON())).toStrictEqual(model);
});

it("SHOULD map the families of /user/me", () => {
  const families = [
    { id: "family-1", name: "Family", status: "ACTIVE" },
    { id: "family-2", name: "Old", status: "ARCHIVED" },
  ];

  const model = UserModel.fromJSON({ ...mocks.json, families });

  expect(model.families).toEqual(families);
});

it.each([
  ["missing", undefined],
  ["not an array", "x"],
  ["null", null],
])("SHOULD default the families to [] WHEN they are %s", (_label, families) => {
  expect(UserModel.fromJSON({ ...mocks.json, families }).families).toEqual([]);
});

it("SHOULD NOT put the families in the cached profile json", () => {
  const model = UserModel.fromJSON({
    ...mocks.json,
    families: [{ id: "family-1", name: "Family", status: "ACTIVE" }],
  });

  expect(model.toJSON()).not.toHaveProperty("families");
});
