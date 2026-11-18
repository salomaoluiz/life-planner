import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetFrequentStockItemsUseCaseParams = { limit?: number };

// Spec 117 FR 16: the most moved items of the last 30 days across the owners the user can write.
function getFrequentStockItemsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetFrequentStockItemsUseCaseParams,
  StockDTO[]
> {
  return {
    execute: async (params: GetFrequentStockItemsUseCaseParams) => {
      try {
        const rows = await repositories.stockRepository.getFrequentStockItems(
          params.limit,
        );

        return rows.map((row) => StockDTO.fromEntity(row));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getFrequentStockItemsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_frequent_stock_items_use_case",
  };
}

export default getFrequentStockItemsUseCase;
