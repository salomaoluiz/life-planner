import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

import ConfigsModel from "./ConfigsModel";
import { mocks, setup } from "./mocks/ConfigsModel.mocks";

it("SHOULD the ConfigsModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("language", mocks.json.language);
  expect(result).toHaveProperty("themeMode", ThemeMode.DARK);
  expect(result).not.toHaveProperty("darkMode");
});

it("SHOULD fromJSON create a ConfigsModel from theme_mode", () => {
  expect(ConfigsModel.fromJSON(mocks.json)).toStrictEqual(setup());
});

it("SHOULD toJSON return only language and theme_mode", () => {
  expect(setup().toJSON()).toStrictEqual(mocks.json);
});

it.each([
  [true, ThemeMode.DARK],
  [false, ThemeMode.LIGHT],
])("SHOULD migrate a legacy dark_mode=%s to %s", (darkMode, expected) => {
  const model = ConfigsModel.fromJSON({
    dark_mode: darkMode,
    language: "pt-BR",
  });

  expect(model.themeMode).toBe(expected);
  expect(model.toJSON()).toStrictEqual({
    language: "pt-BR",
    theme_mode: expected,
  });
});

it("SHOULD fall back to SYSTEM WHEN no theme value is stored", () => {
  expect(ConfigsModel.fromJSON({ language: "en-US" }).themeMode).toBe(
    ThemeMode.SYSTEM,
  );
});

it("SHOULD prefer theme_mode over a legacy dark_mode WHEN both are stored", () => {
  const model = ConfigsModel.fromJSON({
    dark_mode: true,
    language: "en-US",
    theme_mode: "LIGHT",
  });

  expect(model.themeMode).toBe(ThemeMode.LIGHT);
});

it.each(["PURPLE", 3, null, ""])(
  "SHOULD fall back to SYSTEM WHEN theme_mode is garbage (%p)",
  (value) => {
    expect(
      ConfigsModel.fromJSON({ language: "en-US", theme_mode: value }).themeMode,
    ).toBe(ThemeMode.SYSTEM);
  },
);
