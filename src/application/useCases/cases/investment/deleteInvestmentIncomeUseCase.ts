import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function deleteInvestmentIncomeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (params: string) => {
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
