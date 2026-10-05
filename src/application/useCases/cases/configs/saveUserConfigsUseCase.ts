import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface SaveUserConfigsUseCaseParams {
  language?: string;
  themeMode?: ThemeMode;
}

function saveUserConfigsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<SaveUserConfigsUseCaseParams, void> {
  return {
    execute: async (params: SaveUserConfigsUseCaseParams) => {
      try {
        const configs = await repositories.configsRepository.getConfigs();

        await repositories.configsRepository.saveConfigs({
          language: params.language ?? configs.language,
          themeMode: params.themeMode ?? configs.themeMode,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "saveUserConfigsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "configs.save_user_configs_use_case",
  };
}

export default saveUserConfigsUseCase;
