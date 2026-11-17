import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeSeries } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpdateInvestmentIncomeSeriesParams } from "@domain/repositories/investment";

function updateInvestmentIncomeSeriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateInvestmentIncomeSeriesParams,
  InvestmentIncomeSeries
> {
  return {
    execute: async (params: UpdateInvestmentIncomeSeriesParams) => {
      try {
        return await repositories.investmentRepository.updateIncomeSeries(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.updateInvestmentIncomeSeriesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.update_income_series_use_case",
  };
}

export default updateInvestmentIncomeSeriesUseCase;
