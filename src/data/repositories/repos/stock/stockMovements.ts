import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import { toStockEntity, toStockMovementEntity } from "./toStockEntity";

export async function createStockMovement(
  params: Parameters<StockRepository["createStockMovement"]>[0],
  datasources: Datasources,
) {
  const { ownerId, ...movement } = params;
  const result =
    await datasources.stockDatasource.createStockMovement(movement);

  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, { uniqueId: ownerId });

  return {
    item: toStockEntity(result.item),
    movements: result.movements.map((row) => toStockMovementEntity(row)),
  };
}

export async function getOwnerChangePreview(
  params: Parameters<StockRepository["getOwnerChangePreview"]>[0],
  datasources: Datasources,
) {
  return datasources.stockDatasource.getOwnerChangePreview(params);
}

export async function getStockMovements(
  params: Parameters<StockRepository["getStockMovements"]>[0],
  datasources: Datasources,
) {
  const page = await datasources.stockDatasource.getStockMovements(params);

  return {
    items: page.items.map((row) => toStockMovementEntity(row)),
    nextCursor: page.nextCursor,
  };
}

export async function suggestStockItems(
  params: Parameters<StockRepository["suggestStockItems"]>[0],
  datasources: Datasources,
) {
  const rows = await datasources.stockDatasource.suggestStockItems(params);

  return rows.map((row) => ({ ...row }));
}
