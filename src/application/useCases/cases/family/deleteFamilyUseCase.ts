import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteFamilyParams {
  id: string;
}

function deleteFamilyUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteFamilyParams, void> {
  return {
    execute: async (params: DeleteFamilyParams) => {
      try {
        await repositories.familyRepository.deleteFamily(params.id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "deleteFamilyUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family.delete_family_use_case",
  };
}

export default deleteFamilyUseCase;
