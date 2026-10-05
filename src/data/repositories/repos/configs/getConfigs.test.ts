import ConfigsEntity, {
  ThemeMode,
} from "@domain/entities/configs/ConfigsEntity";

import { mocks, setup, spies } from "./mocks/getConfigs.mocks";

it("should return default configs when cache is empty", async () => {
  const result = await setup();

  expect(result).toEqual(ConfigsEntity.defaultConfigs());
});

it("should return cached configs when cache is not empty", async () => {
  spies.getCache.mockReturnValue(mocks.configsModel);

  const result = await setup();

  expect(result).toEqual(
    new ConfigsEntity({
      language: mocks.configsModel.language,
      themeMode: ThemeMode.SYSTEM,
    }),
  );
});

it("should migrate a legacy cached dark_mode to a theme mode", async () => {
  spies.getCache.mockReturnValue({ dark_mode: true, language: "en-US" });

  const result = await setup();

  expect(result.themeMode).toBe(ThemeMode.DARK);
});
