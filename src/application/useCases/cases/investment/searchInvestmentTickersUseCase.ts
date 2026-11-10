import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentTickerSuggestion } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { SearchInvestmentTickersParams } from "@domain/repositories/investment";

function searchInvestmentTickersUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  SearchInvestmentTickersParams,
  InvestmentTickerSuggestion[]
> {
  return {
    execute: async (params: SearchInvestmentTickersParams) => {
      try {
        return await repositories.investmentRepository.searchTickers(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.searchInvestmentTickersUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.search_tickers_use_case",
  };
}

export default searchInvestmentTickersUseCase;
