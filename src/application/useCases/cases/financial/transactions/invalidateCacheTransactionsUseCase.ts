import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function invalidateCacheTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        await repositories.financialRepository.transaction.invalidateTransactions();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.invalidateCacheTransactionsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.invalidate_cache_transactions_use_case",
  };
}

export default invalidateCacheTransactionsUseCase;
