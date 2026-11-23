import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type DeletePurchaseRowUseCaseParams = Parameters<
  PurchaseRepository["deletePurchaseRow"]
>[0];

// Spec 120: Removes a row of the cart (FR 12).
function deletePurchaseRowUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeletePurchaseRowUseCaseParams, void> {
  return {
    execute: async (params: DeletePurchaseRowUseCaseParams) => {
      try {
        return await repositories.stockRepository.deletePurchaseRow(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "deletePurchaseRowUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.delete_purchase_row_use_case",
  };
}

export default deletePurchaseRowUseCase;
