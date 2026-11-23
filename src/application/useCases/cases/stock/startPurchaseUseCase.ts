import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type StartPurchaseUseCaseParams = Parameters<
  PurchaseRepository["startPurchase"]
>[0];

// Spec 120: Starts a purchase with a client id (FR 2).
function startPurchaseUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  StartPurchaseUseCaseParams,
  PurchaseEntity
> {
  return {
    execute: async (params: StartPurchaseUseCaseParams) => {
      try {
        return await repositories.stockRepository.startPurchase(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "startPurchaseUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.start_purchase_use_case",
  };
}

export default startPurchaseUseCase;
