import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type DeleteStockLocationUseCaseParams = { id: string; moveTo?: string };

function deleteStockLocationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteStockLocationUseCaseParams, void> {
  return {
    execute: async (params: DeleteStockLocationUseCaseParams) => {
      try {
        await repositories.stockRepository.deleteStockLocation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "deleteStockLocationUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.delete_stock_location_use_case",
  };
}

export default deleteStockLocationUseCase;
