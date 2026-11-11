import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncome } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpdateInvestmentIncomeParams } from "@domain/repositories/investment";

function updateInvestmentIncomeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateInvestmentIncomeParams,
  InvestmentIncome
> {
  return {
    execute: async (params: UpdateInvestmentIncomeParams) => {
      try {
        return await repositories.investmentRepository.updateIncome(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.updateInvestmentIncomeUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.update_income_use_case",
  };
}

export default updateInvestmentIncomeUseCase;
