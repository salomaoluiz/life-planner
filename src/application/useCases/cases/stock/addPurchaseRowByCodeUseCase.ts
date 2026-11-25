import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { PurchaseRowByCodeEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";

export type AddPurchaseRowByCodeUseCaseParams = {
  clientId?: string;
  code: string;
  purchaseId: string;
};

// Spec 121 FR 25: "Ler código" in the shopping mode adds the item, a named row from Open Food Facts or a placeholder.
function addPurchaseRowByCodeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  AddPurchaseRowByCodeUseCaseParams,
  PurchaseRowByCodeEntity
> {
  return {
    execute: async (params: AddPurchaseRowByCodeUseCaseParams) => {
      try {
        return await repositories.stockRepository.addPurchaseRowByCode(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "addPurchaseRowByCodeUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.add_purchase_row_by_code_use_case",
  };
}

export default addPurchaseRowByCodeUseCase;
