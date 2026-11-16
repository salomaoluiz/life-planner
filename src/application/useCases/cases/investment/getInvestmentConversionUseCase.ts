import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentConversion } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

function getInvestmentConversionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, InvestmentConversion> {
  return {
    execute: async (id: string) => {
      try {
        return await repositories.investmentRepository.getConversion(id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentConversionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_conversion_use_case",
  };
}

export default getInvestmentConversionUseCase;
