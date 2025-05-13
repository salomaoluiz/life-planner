import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";
import {
  ConfigsRepository,
  SaveConfigsRepositoryParams,
} from "@domain/repositories/configs";

import getConfigs from "./getConfigs";
import saveConfigs from "./saveConfigs";

function configsRepositoryImpl(): ConfigsRepository {
  return {
    async getConfigs(): Promise<ConfigsEntity> {
      return getConfigs();
    },
    async saveConfigs(params: SaveConfigsRepositoryParams): Promise<void> {
      return saveConfigs(params);
    },
  };
}

export default configsRepositoryImpl;
