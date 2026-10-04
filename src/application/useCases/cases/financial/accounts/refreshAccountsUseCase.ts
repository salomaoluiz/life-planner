import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { CacheStringKeys } from "@domain/entities/cache/keys";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function refreshAccountsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        await repositories.cacheRepository.invalidate({
          keys: [CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA],
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.refreshAccountsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.refresh_accounts_use_case",
  };
}

export default refreshAccountsUseCase;
