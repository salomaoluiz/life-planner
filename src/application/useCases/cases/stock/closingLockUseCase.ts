import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type ClosingLockUseCaseParams = Parameters<
  PurchaseRepository["closingLock"]
>[0];

// Spec 120: One closer at a time (FR 30).
function closingLockUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<ClosingLockUseCaseParams, void> {
  return {
    execute: async (params: ClosingLockUseCaseParams) => {
      try {
        return await repositories.stockRepository.closingLock(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "closingLockUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.closing_lock_use_case",
  };
}

export default closingLockUseCase;
