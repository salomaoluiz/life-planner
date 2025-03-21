import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import StockEntity from "@domain/entities/stock/StockEntity";
import Repositories from "@domain/repositories";

export interface GetStockItemsUseCaseParams {
  ownerIds: string[];
}

function getStockItemsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetStockItemsUseCaseParams, StockDTO[]> {
  return {
    execute: async (params) => {
      try {
        const promises = params.ownerIds.map(async (ownerId) =>
          repositories.stockRepository.getStockItems(ownerId),
        );

        const entities = await Promise.all(promises);

        return entities
          .flat()
          .map((entity: StockEntity) => StockDTO.fromEntity(entity));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockItemsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_items_use_case",
  };
}

export default getStockItemsUseCase;
