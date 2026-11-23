import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ItemPricePointEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type GetItemPricesUseCaseParams = Parameters<
  PurchaseRepository["getItemPrices"]
>[0];

// Spec 120: Price history of an item, per market (FR 37).
function getItemPricesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetItemPricesUseCaseParams,
  { items: ItemPricePointEntity[]; nextCursor?: string }
> {
  return {
    execute: async (params: GetItemPricesUseCaseParams) => {
      try {
        return await repositories.stockRepository.getItemPrices(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getItemPricesUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_item_prices_use_case",
  };
}

export default getItemPricesUseCase;
