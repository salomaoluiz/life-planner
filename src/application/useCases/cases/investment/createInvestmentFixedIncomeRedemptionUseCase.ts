import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentFixedIncomeWriteResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateFixedIncomeRedemptionParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function createInvestmentFixedIncomeRedemptionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateFixedIncomeRedemptionParams,
  InvestmentFixedIncomeWriteResult
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: CreateFixedIncomeRedemptionParams) => {
      try {
        return await repo.createFixedIncomeRedemption(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentFixedIncomeRedemptionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_investment_fixed_income_redemption_use_case",
  };
}

export default createInvestmentFixedIncomeRedemptionUseCase;
