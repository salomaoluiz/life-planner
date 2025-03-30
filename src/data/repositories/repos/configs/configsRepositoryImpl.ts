import ConfigsModel from "@data/models/configs/ConfigsModel";
import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";
import {
  ConfigsRepository,
  SaveConfigsRepositoryParams,
} from "@domain/repositories/configs";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function configsRepositoryImpl(): ConfigsRepository {
  return {
    async getConfigs(): Promise<ConfigsEntity> {
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
    },
    async saveConfigs(params: SaveConfigsRepositoryParams): Promise<void> {
      const model = new ConfigsModel({
        darkMode: params.darkMode,
        language: params.language,
      });

      cache.set(CacheStringKeys.CACHE_CONFIGS_DATA, model.toJSON(), {
        TTL: 0,
      });
    },
  };
}

export default configsRepositoryImpl;
