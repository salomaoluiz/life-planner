import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface SaveUserConfigsUseCaseParams {
  darkMode?: boolean;
  language?: string;
}

function saveUserConfigsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<SaveUserConfigsUseCaseParams, void> {
  return {
    execute: async (params: SaveUserConfigsUseCaseParams) => {
      try {
        const configs = await repositories.configsRepository.getConfigs();

        await repositories.configsRepository.saveConfigs({
          darkMode: params.darkMode ?? configs.darkMode,
          language: params.language ?? configs.language,
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
