import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseRowResultEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { UpsertPurchaseRowParams } from "@domain/repositories/stock";

export type UpsertPurchaseRowUseCaseParams = UpsertPurchaseRowParams;

// Spec 120: One idempotent write of a purchase row (FR 12-18).
function upsertPurchaseRowUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpsertPurchaseRowUseCaseParams,
  PurchaseRowResultEntity
> {
  return {
    execute: async (params: UpsertPurchaseRowUseCaseParams) => {
      try {
        return await repositories.stockRepository.upsertPurchaseRow(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "upsertPurchaseRowUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.upsert_purchase_row_use_case",
  };
}

export default upsertPurchaseRowUseCase;
