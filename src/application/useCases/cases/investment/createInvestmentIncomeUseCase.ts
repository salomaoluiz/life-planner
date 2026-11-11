import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncome } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentIncomeParams } from "@domain/repositories/investment";

function createInvestmentIncomeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentIncomeParams,
  InvestmentIncome
> {
  return {
    execute: async (params: CreateInvestmentIncomeParams) => {
      try {
        return await repositories.investmentRepository.createIncome(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentIncomeUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_income_use_case",
  };
}

export default createInvestmentIncomeUseCase;
