import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function rejectInvestmentEventSuggestionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.rejectEventSuggestion(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.rejectInvestmentEventSuggestionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.reject_event_suggestion_use_case",
  };
}

export default rejectInvestmentEventSuggestionUseCase;
