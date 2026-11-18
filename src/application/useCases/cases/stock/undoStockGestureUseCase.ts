import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type UndoStockGestureUseCaseParams = {
  clientId?: string;
  gestureId: string;
  ownerId: string;
};

function undoStockGestureUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UndoStockGestureUseCaseParams, StockDTO> {
  return {
    execute: async (params: UndoStockGestureUseCaseParams) => {
      try {
        return StockDTO.fromEntity(
          await repositories.stockRepository.undoStockGesture(params),
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "undoStockGestureUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.undo_stock_gesture_use_case",
  };
}

export default undoStockGestureUseCase;
