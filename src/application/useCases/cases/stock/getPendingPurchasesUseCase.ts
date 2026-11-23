import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PendingPurchaseEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";

export type GetPendingPurchasesUseCaseParams = Record<string, never>;

// Spec 120: Forgotten purchases for the Home banner (FR 8, 45).
function getPendingPurchasesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetPendingPurchasesUseCaseParams,
  PendingPurchaseEntity[]
> {
  return {
    execute: async () => {
      try {
        return await repositories.stockRepository.getPendingPurchases();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getPendingPurchasesUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_pending_purchases_use_case",
  };
}

export default getPendingPurchasesUseCase;
