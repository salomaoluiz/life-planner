import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentFixedIncomeRedemptionPreview } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { PreviewFixedIncomeRedemptionParams } from "@domain/repositories/investment";

// Spec 105: pass-through with context, like the other investment use cases.
function previewInvestmentFixedIncomeRedemptionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  PreviewFixedIncomeRedemptionParams,
  InvestmentFixedIncomeRedemptionPreview
> {
  const repo = repositories.investmentRepository;

  return {
    execute: async (params: PreviewFixedIncomeRedemptionParams) => {
      try {
        return await repo.previewFixedIncomeRedemption(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.previewInvestmentFixedIncomeRedemptionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName:
      "investment.preview_investment_fixed_income_redemption_use_case",
  };
}

export default previewInvestmentFixedIncomeRedemptionUseCase;
