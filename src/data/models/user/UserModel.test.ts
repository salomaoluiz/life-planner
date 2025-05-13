import { mocks, setup } from "./mocks/UserModel.mocks";
import UserModel from "./UserModel";

it("SHOULD the UserModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("email", mocks.json.email);
  expect(result).toHaveProperty("avatarURL", mocks.json.avatar_url);
});

it("SHOULD the UserModel fromJson create a new UserModel", () => {
  const modelFromJson = UserModel.fromJSON({
    avatar_url: mocks.json.avatar_url,
    email: mocks.json.email,
    id: mocks.json.id,
    name: mocks.json.name,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the UserModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
