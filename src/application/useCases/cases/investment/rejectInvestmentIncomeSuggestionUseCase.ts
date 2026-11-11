import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function rejectInvestmentIncomeSuggestionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.rejectIncomeSuggestion(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.rejectInvestmentIncomeSuggestionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.reject_income_suggestion_use_case",
  };
}

export default rejectInvestmentIncomeSuggestionUseCase;
