import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ClosedPurchaseEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { ClosePurchaseParams } from "@domain/repositories/stock";

export type ClosePurchaseUseCaseParams = ClosePurchaseParams;

// Spec 120: Closing writes stock, finance and history in one request (FR 33).
function closePurchaseUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ClosePurchaseUseCaseParams,
  ClosedPurchaseEntity
> {
  return {
    execute: async (params: ClosePurchaseUseCaseParams) => {
      try {
        return await repositories.stockRepository.closePurchase(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "closePurchaseUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.close_purchase_use_case",
  };
}

export default closePurchaseUseCase;
