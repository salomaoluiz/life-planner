import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { SplitResultEntity } from "@domain/entities/financial/SplitEntity";
import Repositories from "@domain/repositories";

// Spec 119: a split with its parts for the form.
function getSplitUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, SplitResultEntity> {
  return {
    execute: async (id: string) => {
      try {
        return await repositories.financialRepository.split.getSplit(id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getSplitUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.get_split_use_case",
  };
}

export default getSplitUseCase;
