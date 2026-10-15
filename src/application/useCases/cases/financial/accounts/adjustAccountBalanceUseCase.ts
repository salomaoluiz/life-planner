import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface AdjustAccountBalanceUseCaseParams {
  // The balance the user wants to see today; the API records the difference as a transaction.
  balance: number;
  id: string;
}

function adjustAccountBalanceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<AdjustAccountBalanceUseCaseParams, void> {
  return {
    execute: async (params: AdjustAccountBalanceUseCaseParams) => {
      try {
        await repositories.financialRepository.account.adjustAccountBalance({
          balance: params.balance,
          id: params.id,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.adjustAccountBalanceUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.adjust_account_balance_use_case",
  };
}

export default adjustAccountBalanceUseCase;
