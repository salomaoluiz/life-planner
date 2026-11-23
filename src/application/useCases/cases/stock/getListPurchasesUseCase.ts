import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ListPurchasesEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type GetListPurchasesUseCaseParams = Parameters<
  PurchaseRepository["getListPurchases"]
>[0];

// Spec 120: Open/ended purchases of a list, or closed ones by page (FR 43).
function getListPurchasesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetListPurchasesUseCaseParams,
  ListPurchasesEntity
> {
  return {
    execute: async (params: GetListPurchasesUseCaseParams) => {
      try {
        return await repositories.stockRepository.getListPurchases(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getListPurchasesUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_list_purchases_use_case",
  };
}

export default getListPurchasesUseCase;
