import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpsertFixedIncomeTermsParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function upsertInvestmentFixedIncomeTermsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpsertFixedIncomeTermsParams,
  InvestmentAssetDetail
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: UpsertFixedIncomeTermsParams) => {
      try {
        return await repo.upsertFixedIncomeTerms(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.upsertInvestmentFixedIncomeTermsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.upsert_investment_fixed_income_terms_use_case",
  };
}

export default upsertInvestmentFixedIncomeTermsUseCase;
