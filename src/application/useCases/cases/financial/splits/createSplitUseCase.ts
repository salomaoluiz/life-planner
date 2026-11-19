import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { SplitResultEntity } from "@domain/entities/financial/SplitEntity";
import Repositories from "@domain/repositories";
import { CreateSplitRepositoryParams } from "@domain/repositories/financial";

export type CreateSplitUseCaseParams = CreateSplitRepositoryParams;

// Spec 119: a new split, or a saved transaction converted into its first part.
function createSplitUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateSplitUseCaseParams,
  SplitResultEntity
> {
  return {
    execute: async (params: CreateSplitUseCaseParams) => {
      try {
        return await repositories.financialRepository.split.createSplit(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createSplitUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.create_split_use_case",
  };
}

export default createSplitUseCase;
