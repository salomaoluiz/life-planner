import { Datasources } from "@data/datasource";
import {
  StockCatalogStatus,
  StockLocationDetailEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import { toStockEntity } from "./toStockEntity";

export async function getFrequentStockItems(
  limit: number | undefined,
  datasources: Datasources,
) {
  const rows = await datasources.stockDatasource.getFrequentStockItems(limit);

  return rows.map((row) => toStockEntity(row));
}

export async function getStockLocation(
  id: string,
  datasources: Datasources,
): Promise<StockLocationDetailEntity> {
  const row = await datasources.stockDatasource.getStockLocation(id);

  return {
    color: row.color,
    icon: row.icon,
    id: row.id,
    itemCount: row.itemCount,
    name: row.name,
    owner: row.owner,
    ownerId: row.ownerId,
    parentId: row.parentId,
    path: row.path,
    status: row.status as StockCatalogStatus,
  };
}

export async function setStockGestureExpiration(
  params: Parameters<StockRepository["setStockGestureExpiration"]>[0],
  datasources: Datasources,
) {
  const { ownerId, ...rest } = params;
  const item =
    await datasources.stockDatasource.setStockGestureExpiration(rest);

  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, { uniqueId: ownerId });

  return toStockEntity(item);
}

export async function undoStockGesture(
  params: Parameters<StockRepository["undoStockGesture"]>[0],
  datasources: Datasources,
) {
  const { ownerId, ...rest } = params;
  const item = await datasources.stockDatasource.undoStockGesture(rest);

  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, { uniqueId: ownerId });

  return toStockEntity(item);
}
