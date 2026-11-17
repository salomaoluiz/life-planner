import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeSeries } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

function getInvestmentIncomeSeriesByIdUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, InvestmentIncomeSeries> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.getIncomeSeriesById(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomeSeriesByIdUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_income_series_by_id_use_case",
  };
}

export default getInvestmentIncomeSeriesByIdUseCase;
