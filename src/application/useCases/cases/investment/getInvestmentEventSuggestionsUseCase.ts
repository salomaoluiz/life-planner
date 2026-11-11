import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentEventSuggestion } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentEventSuggestionsParams } from "@domain/repositories/investment";

function getInvestmentEventSuggestionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentEventSuggestionsParams,
  InvestmentEventSuggestion[]
> {
  return {
    execute: async (params: GetInvestmentEventSuggestionsParams) => {
      try {
        return await repositories.investmentRepository.getEventSuggestions(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentEventSuggestionsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_event_suggestions_use_case",
  };
}

export default getInvestmentEventSuggestionsUseCase;
