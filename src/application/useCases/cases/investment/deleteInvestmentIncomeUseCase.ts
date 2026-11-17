import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { DeleteInvestmentIncomeParams } from "@domain/repositories/investment";

function deleteInvestmentIncomeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteInvestmentIncomeParams, void> {
  return {
    execute: async (params: DeleteInvestmentIncomeParams) => {
      try {
        return await repositories.investmentRepository.deleteIncome(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentIncomeUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_income_use_case",
  };
}

export default deleteInvestmentIncomeUseCase;
