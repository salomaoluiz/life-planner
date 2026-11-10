import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentFixedIncomeSimulation } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { SimulateFixedIncomeParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function simulateInvestmentFixedIncomeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  SimulateFixedIncomeParams,
  InvestmentFixedIncomeSimulation
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: SimulateFixedIncomeParams) => {
      try {
        return await repo.simulateFixedIncome(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.simulateInvestmentFixedIncomeUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.simulate_investment_fixed_income_use_case",
  };
}

export default simulateInvestmentFixedIncomeUseCase;
