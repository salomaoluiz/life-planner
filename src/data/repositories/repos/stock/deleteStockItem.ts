import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<StockRepository["deleteStockItem"]>[0];

// TODO: Fix the delete stock to take account the item id and owner id

async function deleteStockItem(params: Params, datasources: Datasources) {
  await datasources.stockDatasource.deleteStockItem(params.id);

  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, {
    uniqueId: params.ownerId,
  });
}

export default deleteStockItem;
