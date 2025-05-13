import ConfigsModel from "./ConfigsModel";
import { mocks, setup } from "./mocks/ConfigsModel.mocks";

it("SHOULD the ConfigsModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("darkMode", mocks.json.dark_mode);
  expect(result).toHaveProperty("language", mocks.json.language);
});

it("SHOULD the ConfigsModel fromJson create a new ConfigsModel", () => {
  const modelFromJson = ConfigsModel.fromJSON({
    dark_mode: mocks.json.dark_mode,
    language: mocks.json.language,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the ConfigsModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
