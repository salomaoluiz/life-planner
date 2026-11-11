import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomeLink } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

function getInvestmentIncomeLinkUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, InvestmentIncomeLink | undefined> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.getIncomeLink(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomeLinkUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_income_link_use_case",
  };
}

export default getInvestmentIncomeLinkUseCase;
