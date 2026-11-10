import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 105: pass-through with context, like the other investment use cases.
function deleteInvestmentFixedIncomeRateUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: string) => {
      try {
        return await repo.deleteFixedIncomeRate(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentFixedIncomeRateUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_investment_fixed_income_rate_use_case",
  };
}

export default deleteInvestmentFixedIncomeRateUseCase;
