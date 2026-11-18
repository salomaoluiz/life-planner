import StockDTO from "@application/dto/stock/StockDTO";
import StockMovementDTO from "@application/dto/stock/StockMovementDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type CreateStockMovementUseCaseParams = {
  clientId?: string;
  countedQuantity?: number;
  expirationDate?: Date;
  expiredLots?: string;
  gestureId?: string;
  itemId: string;
  lotId?: string;
  note?: string;
  ownerId: string;
  purchaseDate?: Date;
  quantity?: number;
  reason?: string;
  target?: string;
  type: string;
};

function createStockMovementUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateStockMovementUseCaseParams,
  { item: StockDTO; movements: StockMovementDTO[] }
> {
  return {
    execute: async (params: CreateStockMovementUseCaseParams) => {
      try {
        const result =
          await repositories.stockRepository.createStockMovement(params);

        return {
          item: StockDTO.fromEntity(result.item),
          movements: result.movements.map((row) =>
            StockMovementDTO.fromEntity(row),
          ),
        };
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createStockMovementUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_stock_movement_use_case",
  };
}

export default createStockMovementUseCase;
