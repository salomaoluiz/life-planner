import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";

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
      darkMode: mocks.configsModel.dark_mode,
      language: mocks.configsModel.language,
    }),
  );
});
