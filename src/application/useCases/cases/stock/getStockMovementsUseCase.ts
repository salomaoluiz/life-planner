import StockMovementDTO from "@application/dto/stock/StockMovementDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetStockMovementsUseCaseParams = {
  cursor?: string;
  itemId: string;
};

function getStockMovementsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetStockMovementsUseCaseParams,
  { items: StockMovementDTO[]; nextCursor?: string }
> {
  return {
    execute: async (params: GetStockMovementsUseCaseParams) => {
      try {
        const page =
          await repositories.stockRepository.getStockMovements(params);

        return {
          items: page.items.map((row) => StockMovementDTO.fromEntity(row)),
          nextCursor: page.nextCursor,
        };
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockMovementsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_movements_use_case",
  };
}

export default getStockMovementsUseCase;
