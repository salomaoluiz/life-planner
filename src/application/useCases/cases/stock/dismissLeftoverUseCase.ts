import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { DismissLeftoverRepositoryParams } from "@domain/repositories/stock";

export type DismissLeftoverUseCaseParams = DismissLeftoverRepositoryParams;

// Spec 123 FR 25: dismiss (or undo dismissing) the leftover warning of a lot.
function dismissLeftoverUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DismissLeftoverUseCaseParams, void> {
  return {
    execute: async (params: DismissLeftoverUseCaseParams) => {
      try {
        return await repositories.stockRepository.dismissLeftover(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "dismissLeftoverUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.dismiss_leftover_use_case",
  };
}

export default dismissLeftoverUseCase;
