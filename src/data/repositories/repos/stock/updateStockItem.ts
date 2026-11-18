import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<StockRepository["updateStockItem"]>[0];

async function updateStockItem(params: Params, datasources: Datasources) {
  const { previousOwnerId, ...update } = params;

  await datasources.stockDatasource.updateStockItem(update);

  // A move changes two lists.
  [previousOwnerId, params.ownerId].forEach((uniqueId) => {
    if (uniqueId) {
      cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, { uniqueId });
    }
  });
}

export default updateStockItem;
