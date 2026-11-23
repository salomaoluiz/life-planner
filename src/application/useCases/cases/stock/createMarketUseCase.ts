import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { MarketEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { CreateMarketParams } from "@domain/repositories/stock";

export type CreateMarketUseCaseParams = CreateMarketParams;

// Spec 120: A market of the owner (FR 9).
function createMarketUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateMarketUseCaseParams, MarketEntity> {
  return {
    execute: async (params: CreateMarketUseCaseParams) => {
      try {
        return await repositories.stockRepository.createMarket(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "createMarketUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_market_use_case",
  };
}

export default createMarketUseCase;
