import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseViewEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";

export type GetPurchaseUseCaseParams = { id: string };

// Spec 120: The purchase with its rows, cart and forecast (FR 19-20).
function getPurchaseUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetPurchaseUseCaseParams,
  PurchaseViewEntity
> {
  return {
    execute: async (params: GetPurchaseUseCaseParams) => {
      try {
        return await repositories.stockRepository.getPurchase(params.id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getPurchaseUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_purchase_use_case",
  };
}

export default getPurchaseUseCase;
