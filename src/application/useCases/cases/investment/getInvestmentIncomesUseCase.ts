import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncomePage } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentIncomesParams } from "@domain/repositories/investment";

function getInvestmentIncomesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentIncomesParams,
  InvestmentIncomePage
> {
  return {
    execute: async (params: GetInvestmentIncomesParams) => {
      try {
        return await repositories.investmentRepository.getIncomes(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentIncomesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_incomes_use_case",
  };
}

export default getInvestmentIncomesUseCase;
