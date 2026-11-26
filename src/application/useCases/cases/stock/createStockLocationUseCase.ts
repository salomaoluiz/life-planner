import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type CreateStockLocationUseCaseParams = {
  color: string;
  icon: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
};

function createStockLocationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateStockLocationUseCaseParams, void> {
  return {
    execute: async (params: CreateStockLocationUseCaseParams) => {
      try {
        await repositories.stockRepository.createStockLocation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createStockLocationUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_stock_location_use_case",
  };
}

export default createStockLocationUseCase;
