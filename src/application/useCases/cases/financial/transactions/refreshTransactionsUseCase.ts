import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { CacheStringKeys } from "@domain/entities/cache/keys";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function refreshTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        await repositories.cacheRepository.invalidate({
          keys: [CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA],
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.refreshTransactionsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.refresh_transactions_use_case",
  };
}

export default refreshTransactionsUseCase;
