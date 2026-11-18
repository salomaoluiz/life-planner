import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type SetStockGestureExpirationUseCaseParams = {
  clientId?: string;
  expirationDate: Date;
  gestureId: string;
  ownerId: string;
};

function setStockGestureExpirationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  SetStockGestureExpirationUseCaseParams,
  StockDTO
> {
  return {
    execute: async (params: SetStockGestureExpirationUseCaseParams) => {
      try {
        return StockDTO.fromEntity(
          await repositories.stockRepository.setStockGestureExpiration(params),
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "setStockGestureExpirationUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.set_stock_gesture_expiration_use_case",
  };
}

export default setStockGestureExpirationUseCase;
