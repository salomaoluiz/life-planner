import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentOperationResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { ApproveInvestmentEventSuggestionParams } from "@domain/repositories/investment";

function approveInvestmentEventSuggestionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ApproveInvestmentEventSuggestionParams,
  InvestmentOperationResult
> {
  return {
    execute: async (params: ApproveInvestmentEventSuggestionParams) => {
      try {
        return await repositories.investmentRepository.approveEventSuggestion(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.approveInvestmentEventSuggestionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.approve_event_suggestion_use_case",
  };
}

export default approveInvestmentEventSuggestionUseCase;
