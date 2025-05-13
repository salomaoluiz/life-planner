import ConfigsModel from "@data/models/configs/ConfigsModel";
import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

async function getConfigs() {
  const cachedConfigs = cache.get<Record<string, unknown>>(
    CacheStringKeys.CACHE_CONFIGS_DATA,
  );

  if (cachedConfigs) {
    const model = ConfigsModel.fromJSON(cachedConfigs);

    return new ConfigsEntity({
      darkMode: model.darkMode,
      language: model.language,
    });
  }

  return ConfigsEntity.defaultConfigs();
}

export default getConfigs;
