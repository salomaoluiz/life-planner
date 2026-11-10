import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpdateFixedIncomeRateParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function updateInvestmentFixedIncomeRateUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateFixedIncomeRateParams,
  InvestmentAssetDetail
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: UpdateFixedIncomeRateParams) => {
      try {
        return await repo.updateFixedIncomeRate(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.updateInvestmentFixedIncomeRateUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.update_investment_fixed_income_rate_use_case",
  };
}

export default updateInvestmentFixedIncomeRateUseCase;
