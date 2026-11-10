import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentPriceHistory } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentPriceHistoryParams } from "@domain/repositories/investment";

function getInvestmentPriceHistoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentPriceHistoryParams,
  InvestmentPriceHistory
> {
  return {
    execute: async (params: GetInvestmentPriceHistoryParams) => {
      try {
        return await repositories.investmentRepository.getPriceHistory(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentPriceHistoryUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_price_history_use_case",
  };
}

export default getInvestmentPriceHistoryUseCase;
