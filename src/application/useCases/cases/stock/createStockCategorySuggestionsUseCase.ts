import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type CreateStockCategorySuggestionsUseCaseParams = {
  keys?: string[];
  owner: string;
  ownerId: string;
};

function createStockCategorySuggestionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateStockCategorySuggestionsUseCaseParams,
  void
> {
  return {
    execute: async (params: CreateStockCategorySuggestionsUseCaseParams) => {
      try {
        await repositories.stockRepository.createStockCategorySuggestions(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createStockCategorySuggestionsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_stock_category_suggestions_use_case",
  };
}

export default createStockCategorySuggestionsUseCase;
