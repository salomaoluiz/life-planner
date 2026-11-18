import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type UpdateStockLocationUseCaseParams = {
  id: string;
  name?: string;
  status?: string;
};

function updateStockLocationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateStockLocationUseCaseParams, void> {
  return {
    execute: async (params: UpdateStockLocationUseCaseParams) => {
      try {
        await repositories.stockRepository.updateStockLocation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "updateStockLocationUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.update_stock_location_use_case",
  };
}

export default updateStockLocationUseCase;
