import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentQuotesRefresh } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { RefreshInvestmentQuotesParams } from "@domain/repositories/investment";

function refreshInvestmentQuotesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  RefreshInvestmentQuotesParams,
  InvestmentQuotesRefresh
> {
  return {
    execute: async (params: RefreshInvestmentQuotesParams) => {
      try {
        return await repositories.investmentRepository.refreshQuotes(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.refreshInvestmentQuotesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.refresh_quotes_use_case",
  };
}

export default refreshInvestmentQuotesUseCase;
