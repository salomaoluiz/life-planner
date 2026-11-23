import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { MarketEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type GetMarketsUseCaseParams = Parameters<
  PurchaseRepository["getMarkets"]
>[0];

// Spec 120: Markets of the readable owners (FR 9).
function getMarketsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetMarketsUseCaseParams, MarketEntity[]> {
  return {
    execute: async (params: GetMarketsUseCaseParams) => {
      try {
        return await repositories.stockRepository.getMarkets(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getMarketsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_markets_use_case",
  };
}

export default getMarketsUseCase;
