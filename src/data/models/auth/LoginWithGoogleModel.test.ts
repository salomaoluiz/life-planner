import LoginWithGoogleModel from "./LoginWithGoogleModel";
import { mocks, setup } from "./mocks/LoginWithGoogleModel.mocks";

it("SHOULD the LoginWithGoogleModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("avatarURL", mocks.json.avatar_url);
  expect(result).toHaveProperty("email", mocks.json.email);
  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("name", mocks.json.name);
});

it("SHOULD the LoginWithGoogleModel fromJson create a new LoginWithGoogleModel", () => {
  const modelFromJson = LoginWithGoogleModel.fromJSON({
    avatar_url: mocks.json.avatar_url,
    email: mocks.json.email,
    id: mocks.json.id,
    name: mocks.json.name,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the LoginWithGoogleModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
