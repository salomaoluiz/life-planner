import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentConversionResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpdateInvestmentConversionParams } from "@domain/repositories/investment";

function updateInvestmentConversionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateInvestmentConversionParams,
  InvestmentConversionResult
> {
  return {
    execute: async (params: UpdateInvestmentConversionParams) => {
      try {
        return await repositories.investmentRepository.updateConversion(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.updateInvestmentConversionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.update_conversion_use_case",
  };
}

export default updateInvestmentConversionUseCase;
