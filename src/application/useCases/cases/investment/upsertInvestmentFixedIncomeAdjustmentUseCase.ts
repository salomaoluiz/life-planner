import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentFixedIncomeAdjustmentResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpsertFixedIncomeAdjustmentParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function upsertInvestmentFixedIncomeAdjustmentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpsertFixedIncomeAdjustmentParams,
  InvestmentFixedIncomeAdjustmentResult
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: UpsertFixedIncomeAdjustmentParams) => {
      try {
        return await repo.upsertFixedIncomeAdjustment(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.upsertInvestmentFixedIncomeAdjustmentUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.upsert_investment_fixed_income_adjustment_use_case",
  };
}

export default upsertInvestmentFixedIncomeAdjustmentUseCase;
