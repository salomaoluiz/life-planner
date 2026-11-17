import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeSeriesPreview } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentIncomeSeriesParams } from "@domain/repositories/investment";

function previewInvestmentIncomeSeriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentIncomeSeriesParams,
  InvestmentIncomeSeriesPreview
> {
  return {
    execute: async (params: CreateInvestmentIncomeSeriesParams) => {
      try {
        return await repositories.investmentRepository.previewIncomeSeries(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.previewInvestmentIncomeSeriesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.preview_income_series_use_case",
  };
}

export default previewInvestmentIncomeSeriesUseCase;
