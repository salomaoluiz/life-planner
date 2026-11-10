import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 105: pass-through with context, like the other investment use cases.
function deleteInvestmentFixedIncomeAdjustmentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: string) => {
      try {
        return await repo.deleteFixedIncomeAdjustment(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentFixedIncomeAdjustmentUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_investment_fixed_income_adjustment_use_case",
  };
}

export default deleteInvestmentFixedIncomeAdjustmentUseCase;
