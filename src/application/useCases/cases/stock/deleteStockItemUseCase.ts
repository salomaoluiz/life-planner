import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteStockItemUseCaseParams {
  id: string;
  ownerId: string;
}

function deleteStockItemUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteStockItemUseCaseParams, void> {
  return {
    execute: async (params: DeleteStockItemUseCaseParams) => {
      try {
        await repositories.stockRepository.deleteStockItem({
          id: params.id,
          ownerId: params.ownerId,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "deleteStockItemUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.delete_stock_item_use_case",
  };
}

export default deleteStockItemUseCase;
