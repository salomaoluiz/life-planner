import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentMarketIndexHistory } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentMarketIndexHistoryParams } from "@domain/repositories/investment";

// Spec 113 FR 19: the step points, the changes and the followers of one index in a period.
function getInvestmentMarketIndexHistoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentMarketIndexHistoryParams,
  InvestmentMarketIndexHistory
> {
  return {
    execute: async (params: GetInvestmentMarketIndexHistoryParams) => {
      try {
        return await repositories.investmentRepository.getMarketIndexHistory(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentMarketIndexHistoryUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_market_index_history_use_case",
  };
}

export default getInvestmentMarketIndexHistoryUseCase;
