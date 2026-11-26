import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type CreateStockLocationSuggestionsUseCaseParams = {
  keys?: string[];
  owner: string;
  ownerId: string;
};

function createStockLocationSuggestionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateStockLocationSuggestionsUseCaseParams,
  void
> {
  return {
    execute: async (params: CreateStockLocationSuggestionsUseCaseParams) => {
      try {
        await repositories.stockRepository.createStockLocationSuggestions(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createStockLocationSuggestionsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_stock_location_suggestions_use_case",
  };
}

export default createStockLocationSuggestionsUseCase;
