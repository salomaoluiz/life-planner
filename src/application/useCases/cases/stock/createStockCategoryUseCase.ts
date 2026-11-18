import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type CreateStockCategoryUseCaseParams = {
  financeCategoryId?: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
};

function createStockCategoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateStockCategoryUseCaseParams, void> {
  return {
    execute: async (params: CreateStockCategoryUseCaseParams) => {
      try {
        await repositories.stockRepository.createStockCategory(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createStockCategoryUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_stock_category_use_case",
  };
}

export default createStockCategoryUseCase;
