import { StockSuggestionDTO } from "@application/dto/stock/StockCatalogDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type SuggestStockItemsUseCaseParams = {
  owner: string;
  ownerId: string;
  q: string;
};

function suggestStockItemsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  SuggestStockItemsUseCaseParams,
  StockSuggestionDTO[]
> {
  return {
    execute: async (params: SuggestStockItemsUseCaseParams) => {
      try {
        const result =
          await repositories.stockRepository.suggestStockItems(params);

        return result;
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "suggestStockItemsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.suggest_stock_items_use_case",
  };
}

export default suggestStockItemsUseCase;
