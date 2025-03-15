import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface UpdateFamilyUseCaseParams {
  id: string;
  name: string;
}

function updateFamilyUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateFamilyUseCaseParams, void> {
  return {
    execute: async (params: UpdateFamilyUseCaseParams) => {
      try {
        if (!params.id || !params.name) {
          throw new FieldRequired({ id: params.id, name: params.name });
        }

        await repositories.familyRepository.updateFamily({
          id: params.id,
          name: params.name,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "updateFamilyUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family.update_family_use_case",
  };
}

export default updateFamilyUseCase;
