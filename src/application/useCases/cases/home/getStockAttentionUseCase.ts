import StockAttentionDTO, {
  IStockAttentionItemDTO,
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import StockEntity, {
  StockExpirationStatus,
} from "@domain/entities/stock/StockEntity";
import Repositories from "@domain/repositories";

export const MAX_ATTENTION_ITEMS = 3;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface GetStockAttentionUseCaseParams {
  // Injectable for tests; defaults to the current date.
  now?: Date;
  ownerIds: string[];
}

function attentionStatus(entity: StockEntity) {
  if (entity.expirationStatus === StockExpirationStatus.EXPIRED) {
    return StockAttentionStatus.EXPIRED;
  }

  if (entity.expirationStatus === StockExpirationStatus.EXPIRING) {
    return StockAttentionStatus.EXPIRING;
  }

  return entity.needsRestock ? StockAttentionStatus.RESTOCK : undefined;
}

function daysBetween(now: Date, date: Date) {
  function start(value: Date) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
    ).getTime();
  }

  return Math.round((start(date) - start(now)) / DAY_IN_MS);
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
          // Spec 116: the API sends each item's status (worst lot); a low item without a date warning also asks attention.
          const status = attentionStatus(entity);

          if (!status) {
            return;
          }

          attention.push({
            daysLeft: entity.nearestExpiration
              ? daysBetween(now, entity.nearestExpiration)
              : undefined,
            status,
            stock: StockDTO.fromEntity(entity),
          });
        });

        // Expired first, then expiring, then restock; each by date. Array.sort is stable.
        attention.sort(
          (a, b) =>
            rank(a.status) - rank(b.status) ||
            (a.stock.nearestExpiration?.getTime() ?? 0) -
              (b.stock.nearestExpiration?.getTime() ?? 0),
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

function rank(status: StockAttentionStatus) {
  return [
    StockAttentionStatus.EXPIRED,
    StockAttentionStatus.EXPIRING,
    StockAttentionStatus.RESTOCK,
  ].indexOf(status);
}

export default getStockAttentionUseCase;
