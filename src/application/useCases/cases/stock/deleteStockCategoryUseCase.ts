import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type DeleteStockCategoryUseCaseParams = { id: string; moveTo?: string };

function deleteStockCategoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteStockCategoryUseCaseParams, void> {
  return {
    execute: async (params: DeleteStockCategoryUseCaseParams) => {
      try {
        await repositories.stockRepository.deleteStockCategory(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "deleteStockCategoryUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.delete_stock_category_use_case",
  };
}

export default deleteStockCategoryUseCase;
