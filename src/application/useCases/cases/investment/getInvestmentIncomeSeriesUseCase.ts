import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeSeries } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

function getInvestmentIncomeSeriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, InvestmentIncomeSeries[]> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.getIncomeSeries(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomeSeriesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_income_series_use_case",
  };
}

export default getInvestmentIncomeSeriesUseCase;
