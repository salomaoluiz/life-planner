import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";
import Repositories from "@domain/repositories";

export interface SetFamilyStatusUseCaseParams {
  id: string;
  status: FamilyStatus;
}

// Archive / reactivate a family (owner only, spec 042). Archiving can fail with FamilyHasPendingItems.
function setFamilyStatusUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<SetFamilyStatusUseCaseParams, void> {
  return {
    execute: async (params: SetFamilyStatusUseCaseParams) => {
      try {
        if (!params.id || !params.status) {
          throw new FieldRequired({ id: params.id, status: params.status });
        }

        await repositories.familyRepository.updateFamily({
          id: params.id,
          status: params.status,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "setFamilyStatusUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family.set_family_status_use_case",
  };
}

export default setFamilyStatusUseCase;
