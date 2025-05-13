import ConfigsModel from "@data/models/configs/ConfigsModel";
import { ConfigsRepository } from "@domain/repositories/configs";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<ConfigsRepository["saveConfigs"]>[0];

async function saveConfigs(params: Params) {
  const model = new ConfigsModel({
    darkMode: params.darkMode,
    language: params.language,
  });

  cache.set(CacheStringKeys.CACHE_CONFIGS_DATA, model.toJSON(), {
    TTL: 0,
  });
}

export default saveConfigs;
