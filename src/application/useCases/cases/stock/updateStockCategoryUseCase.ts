import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type UpdateStockCategoryUseCaseParams = {
  financeCategoryId?: null | string;
  id: string;
  name?: string;
  parentId?: null | string;
  status?: string;
};

function updateStockCategoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateStockCategoryUseCaseParams, void> {
  return {
    execute: async (params: UpdateStockCategoryUseCaseParams) => {
      try {
        await repositories.stockRepository.updateStockCategory(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "updateStockCategoryUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.update_stock_category_use_case",
  };
}

export default updateStockCategoryUseCase;
