import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 119: the split with every part.
function deleteSplitUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (id: string) => {
      try {
        return await repositories.financialRepository.split.deleteSplit(id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteSplitUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_split_use_case",
  };
}

export default deleteSplitUseCase;
