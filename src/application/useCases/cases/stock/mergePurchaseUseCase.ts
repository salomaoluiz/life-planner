import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type MergePurchaseUseCaseParams = Parameters<
  PurchaseRepository["mergePurchase"]
>[0];

// Spec 120: Merges two purchases of one list (FR 4).
function mergePurchaseUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  MergePurchaseUseCaseParams,
  PurchaseEntity
> {
  return {
    execute: async (params: MergePurchaseUseCaseParams) => {
      try {
        return await repositories.stockRepository.mergePurchase(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "mergePurchaseUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.merge_purchase_use_case",
  };
}

export default mergePurchaseUseCase;
