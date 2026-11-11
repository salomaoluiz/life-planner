import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeSuggestion } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentIncomeSuggestionsParams } from "@domain/repositories/investment";

function getInvestmentIncomeSuggestionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentIncomeSuggestionsParams,
  InvestmentIncomeSuggestion[]
> {
  return {
    execute: async (params: GetInvestmentIncomeSuggestionsParams) => {
      try {
        return await repositories.investmentRepository.getIncomeSuggestions(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomeSuggestionsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_income_suggestions_use_case",
  };
}

export default getInvestmentIncomeSuggestionsUseCase;
