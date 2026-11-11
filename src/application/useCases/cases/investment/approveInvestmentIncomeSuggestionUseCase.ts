import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncome } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { ApproveInvestmentIncomeSuggestionParams } from "@domain/repositories/investment";

function approveInvestmentIncomeSuggestionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ApproveInvestmentIncomeSuggestionParams,
  InvestmentIncome
> {
  return {
    execute: async (params: ApproveInvestmentIncomeSuggestionParams) => {
      try {
        return await repositories.investmentRepository.approveIncomeSuggestion(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.approveInvestmentIncomeSuggestionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.approve_income_suggestion_use_case",
  };
}

export default approveInvestmentIncomeSuggestionUseCase;
