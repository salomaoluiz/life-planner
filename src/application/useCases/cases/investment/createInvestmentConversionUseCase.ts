import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentConversionResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentConversionParams } from "@domain/repositories/investment";

function createInvestmentConversionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentConversionParams,
  InvestmentConversionResult
> {
  return {
    execute: async (params: CreateInvestmentConversionParams) => {
      try {
        return await repositories.investmentRepository.createConversion(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentConversionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_conversion_use_case",
  };
}

export default createInvestmentConversionUseCase;
