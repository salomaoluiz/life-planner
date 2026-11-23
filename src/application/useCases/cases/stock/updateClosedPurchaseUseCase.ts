import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type UpdateClosedPurchaseUseCaseParams = Parameters<
  PurchaseRepository["updateClosedPurchase"]
>[0];

// Spec 120: Edits prices, total, market, date or source of a closed purchase (FR 39).
function updateClosedPurchaseUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateClosedPurchaseUseCaseParams,
  PurchaseEntity
> {
  return {
    execute: async (params: UpdateClosedPurchaseUseCaseParams) => {
      try {
        return await repositories.stockRepository.updateClosedPurchase(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "updateClosedPurchaseUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.update_closed_purchase_use_case",
  };
}

export default updateClosedPurchaseUseCase;
