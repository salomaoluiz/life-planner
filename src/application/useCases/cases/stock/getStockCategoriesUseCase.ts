import { StockCategoryDTO } from "@application/dto/stock/StockCatalogDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetStockCategoriesUseCaseParams = {
  includeArchived?: boolean;
  owner?: string;
  ownerId?: string;
};

function getStockCategoriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetStockCategoriesUseCaseParams,
  StockCategoryDTO[]
> {
  return {
    execute: async (params: GetStockCategoriesUseCaseParams) => {
      try {
        const rows =
          await repositories.stockRepository.getStockCategories(params);

        return rows.map((row) => StockCategoryDTO.fromEntity(row));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockCategoriesUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_categories_use_case",
  };
}

export default getStockCategoriesUseCase;
