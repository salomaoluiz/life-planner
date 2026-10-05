import StockAttentionDTO, {
  IStockAttentionItemDTO,
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import {
  daysUntilExpiration,
  getStockExpirationStatus,
  StockExpirationStatus,
} from "@domain/entities/stock/stockExpiration";
import Repositories from "@domain/repositories";

export const MAX_ATTENTION_ITEMS = 3;

export interface GetStockAttentionUseCaseParams {
  // Injectable for tests; defaults to the current date.
  now?: Date;
  ownerIds: string[];
}

function getStockAttentionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetStockAttentionUseCaseParams,
  StockAttentionDTO
> {
  return {
    execute: async (params) => {
      try {
        const now = params.now ?? new Date();

        const entities = (
          await Promise.all(
            params.ownerIds.map(async (ownerId) =>
              repositories.stockRepository.getStockItems(ownerId),
            ),
          )
        ).flat();

        const attention: IStockAttentionItemDTO[] = [];

        entities.forEach((entity) => {
          // Shared rule (plan 011 Task 1): local calendar days, 0 = today (expiring), 7 = included, 8 = OK.
          const status = getStockExpirationStatus(entity.expirationDate, now);
          const daysLeft = daysUntilExpiration(entity.expirationDate, now);

          if (status === StockExpirationStatus.OK || daysLeft === undefined) {
            return;
          }

          attention.push({
            daysLeft,
            status:
              status === StockExpirationStatus.EXPIRED
                ? StockAttentionStatus.EXPIRED
                : StockAttentionStatus.EXPIRING,
            stock: StockDTO.fromEntity(entity),
          });
        });

        // Expired first because their dates are the oldest. Array.sort is stable.
        attention.sort(
          (a, b) =>
            (a.stock.expirationDate?.getTime() ?? 0) -
            (b.stock.expirationDate?.getTime() ?? 0),
        );

        return new StockAttentionDTO({
          attentionCount: attention.length,
          items: attention.slice(0, MAX_ATTENTION_ITEMS),
          totalItems: entities.length,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "home.getStockAttentionUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "home.get_stock_attention_use_case",
  };
}

export default getStockAttentionUseCase;
