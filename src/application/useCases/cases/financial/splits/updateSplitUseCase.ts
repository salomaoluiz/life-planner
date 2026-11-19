import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { SplitUpdateResultEntity } from "@domain/entities/financial/SplitEntity";
import Repositories from "@domain/repositories";
import { UpdateSplitRepositoryParams } from "@domain/repositories/financial";

export type UpdateSplitUseCaseParams = UpdateSplitRepositoryParams;

// Spec 119: the split replaced (shared fields and parts) or only `paid`; one part left dissolves it.
function updateSplitUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateSplitUseCaseParams,
  SplitUpdateResultEntity
> {
  return {
    execute: async (params: UpdateSplitUseCaseParams) => {
      try {
        return await repositories.financialRepository.split.updateSplit(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateSplitUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.update_split_use_case",
  };
}

export default updateSplitUseCase;
