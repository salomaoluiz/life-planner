import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentMarketIndexes } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

// Spec 113 FR 9: fetches the stale or missing series now (1 per user per minute) and returns the new summary.
function refreshInvestmentMarketIndexesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<InvestmentMarketIndexes> {
  return {
    execute: async () => {
      try {
        return await repositories.investmentRepository.refreshMarketIndexes();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.refreshInvestmentMarketIndexesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.refresh_market_indexes_use_case",
  };
}

export default refreshInvestmentMarketIndexesUseCase;
