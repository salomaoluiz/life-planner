import { VersionDTO } from "@application/dto/version/VersionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetVersionInfoUseCaseParams {
  refresh: boolean;
}

function getVersionInfoUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetVersionInfoUseCaseParams, VersionDTO> {
  return {
    execute: async (params) => {
      try {
        return await repositories.versionRepository.getVersionInfo(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "version.getVersionInfoUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "version.get_version_info_use_case",
  };
}

export default getVersionInfoUseCase;
