import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentIncome } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { ReceiveInvestmentIncomeParams } from "@domain/repositories/investment";

function receiveInvestmentIncomeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ReceiveInvestmentIncomeParams,
  InvestmentIncome
> {
  return {
    execute: async (params: ReceiveInvestmentIncomeParams) => {
      try {
        return await repositories.investmentRepository.receiveIncome(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.receiveInvestmentIncomeUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.receive_income_use_case",
  };
}

export default receiveInvestmentIncomeUseCase;
