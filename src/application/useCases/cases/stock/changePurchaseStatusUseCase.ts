import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type ChangePurchaseStatusUseCaseParams = Parameters<
  PurchaseRepository["changePurchaseStatus"]
>[0];

// Spec 120: End, reopen or discard (FR 5, 7).
function changePurchaseStatusUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ChangePurchaseStatusUseCaseParams,
  PurchaseEntity
> {
  return {
    execute: async (params: ChangePurchaseStatusUseCaseParams) => {
      try {
        return await repositories.stockRepository.changePurchaseStatus(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "changePurchaseStatusUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.change_purchase_status_use_case",
  };
}

export default changePurchaseStatusUseCase;
