import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetStockItemUseCaseParams = { id: string };

function getStockItemUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetStockItemUseCaseParams, StockDTO> {
  return {
    execute: async (params: GetStockItemUseCaseParams) => {
      try {
        const entity = await repositories.stockRepository.getStockItem(
          params.id,
        );

        return StockDTO.fromEntity(entity);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockItemUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_item_use_case",
  };
}

export default getStockItemUseCase;
