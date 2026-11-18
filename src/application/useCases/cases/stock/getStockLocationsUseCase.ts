import { StockLocationDTO } from "@application/dto/stock/StockCatalogDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetStockLocationsUseCaseParams = {
  includeArchived?: boolean;
  owner: string;
  ownerId: string;
};

function getStockLocationsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetStockLocationsUseCaseParams,
  StockLocationDTO[]
> {
  return {
    execute: async (params: GetStockLocationsUseCaseParams) => {
      try {
        const rows =
          await repositories.stockRepository.getStockLocations(params);

        return rows.map((row) => StockLocationDTO.fromEntity(row));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockLocationsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_locations_use_case",
  };
}

export default getStockLocationsUseCase;
