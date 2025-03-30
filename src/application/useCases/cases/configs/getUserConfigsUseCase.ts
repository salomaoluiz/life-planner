import ConfigsDTO from "@application/dto/configs/ConfigsDTO";
import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getUserConfigsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<ConfigsDTO> {
  return {
    execute: async () => {
      try {
        const configs = await repositories.configsRepository.getConfigs();

        return new ConfigsDTO({
          darkMode: configs.darkMode,
          language: configs.language,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getUserConfigsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "configs.get_user_configs_use_case",
  };
}

export default getUserConfigsUseCase;
