import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeDefaults } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentIncomeDefaultsParams } from "@domain/repositories/investment";

function getInvestmentIncomeDefaultsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentIncomeDefaultsParams,
  InvestmentIncomeDefaults
> {
  return {
    execute: async (params: GetInvestmentIncomeDefaultsParams) => {
      try {
        return await repositories.investmentRepository.getIncomeDefaults(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomeDefaultsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_income_defaults_use_case",
  };
}

export default getInvestmentIncomeDefaultsUseCase;
