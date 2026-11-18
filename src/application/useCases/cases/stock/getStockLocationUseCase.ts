import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { StockLocationDetailEntity } from "@domain/entities/stock/StockCatalogEntity";
import Repositories from "@domain/repositories";

export type GetStockLocationUseCaseParams = { id: string };

// Spec 117 FR 20/30: the header of the location QR route (a 404 means "Local não encontrado").
function getStockLocationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetStockLocationUseCaseParams,
  StockLocationDetailEntity
> {
  return {
    execute: async (params: GetStockLocationUseCaseParams) => {
      try {
        return await repositories.stockRepository.getStockLocation(params.id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getStockLocationUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_location_use_case",
  };
}

export default getStockLocationUseCase;
