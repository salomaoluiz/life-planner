import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentProjectedIncome } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentIncomeSeriesProjectionsParams } from "@domain/repositories/investment";

function getInvestmentIncomeSeriesProjectionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentIncomeSeriesProjectionsParams,
  InvestmentProjectedIncome[]
> {
  return {
    execute: async (params: GetInvestmentIncomeSeriesProjectionsParams) => {
      try {
        return await repositories.investmentRepository.getIncomeSeriesProjections(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomeSeriesProjectionsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_income_series_projections_use_case",
  };
}

export default getInvestmentIncomeSeriesProjectionsUseCase;
