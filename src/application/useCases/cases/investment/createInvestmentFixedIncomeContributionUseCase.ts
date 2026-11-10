import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentFixedIncomeWriteResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateFixedIncomeContributionParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function createInvestmentFixedIncomeContributionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateFixedIncomeContributionParams,
  InvestmentFixedIncomeWriteResult
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: CreateFixedIncomeContributionParams) => {
      try {
        return await repo.createFixedIncomeContribution(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase:
              "investment.createInvestmentFixedIncomeContributionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName:
      "investment.create_investment_fixed_income_contribution_use_case",
  };
}

export default createInvestmentFixedIncomeContributionUseCase;
