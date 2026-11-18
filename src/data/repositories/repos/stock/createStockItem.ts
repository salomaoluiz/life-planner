import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import { toStockEntity } from "./toStockEntity";

export type Params = Parameters<StockRepository["createStockItem"]>[0];

async function createStockItem(params: Params, datasources: Datasources) {
  const stock = await datasources.stockDatasource.createStockItem(params);

  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, {
    uniqueId: params.ownerId,
  });

  return toStockEntity(stock);
}

export default createStockItem;
