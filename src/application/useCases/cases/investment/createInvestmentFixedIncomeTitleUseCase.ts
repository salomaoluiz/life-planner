import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateFixedIncomeTitleParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function createInvestmentFixedIncomeTitleUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateFixedIncomeTitleParams,
  InvestmentAssetDetail
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: CreateFixedIncomeTitleParams) => {
      try {
        return await repo.createFixedIncomeTitle(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentFixedIncomeTitleUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_investment_fixed_income_title_use_case",
  };
}

export default createInvestmentFixedIncomeTitleUseCase;
