import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ItemSuggestionEntity } from "@domain/entities/stock/StockBarcodeEntity";
import Repositories from "@domain/repositories";

// Exactly one of `barcode` / `name`.
export type SuggestStockItemUseCaseParams = {
  barcode?: string;
  name?: string;
  owner: string;
  ownerId: string;
};

// Spec 121 FR 12 and 18: Open Food Facts + AI suggestions for a new item; the API never fails because of the providers.
function suggestStockItemUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  SuggestStockItemUseCaseParams,
  ItemSuggestionEntity
> {
  return {
    execute: async (params: SuggestStockItemUseCaseParams) => {
      try {
        return repositories.stockRepository.suggestStockItem(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "suggestStockItemUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.suggest_stock_item_use_case",
  };
}

export default suggestStockItemUseCase;
