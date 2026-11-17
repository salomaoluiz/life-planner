import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeSeriesCreated } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentIncomeSeriesParams } from "@domain/repositories/investment";

function createInvestmentIncomeSeriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentIncomeSeriesParams,
  InvestmentIncomeSeriesCreated
> {
  return {
    execute: async (params: CreateInvestmentIncomeSeriesParams) => {
      try {
        return await repositories.investmentRepository.createIncomeSeries(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentIncomeSeriesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_income_series_use_case",
  };
}

export default createInvestmentIncomeSeriesUseCase;
