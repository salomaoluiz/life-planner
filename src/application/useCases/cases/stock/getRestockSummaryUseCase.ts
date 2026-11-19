import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { RestockSummaryEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";

export type GetRestockSummaryUseCaseParams = Record<string, never>;

// Spec 118 FR 26: the Home card (AUTO and AUTO_EDITED rows of every readable list).
function getRestockSummaryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetRestockSummaryUseCaseParams,
  RestockSummaryEntity
> {
  return {
    execute: async () => {
      try {
        return await repositories.stockRepository.getRestockSummary();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getRestockSummaryUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_restock_summary_use_case",
  };
}

export default getRestockSummaryUseCase;
