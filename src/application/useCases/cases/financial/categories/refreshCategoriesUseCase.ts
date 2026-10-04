import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { CacheStringKeys } from "@domain/entities/cache/keys";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function refreshCategoriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        await repositories.cacheRepository.invalidate({
          keys: [CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA],
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.refreshCategoriesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.refresh_categories_use_case",
  };
}

export default refreshCategoriesUseCase;
