import { Datasources } from "@data/datasource";
import StockModel from "@data/models/stock/StockModel";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import { toStockEntity } from "./toStockEntity";

export type Params = Parameters<StockRepository["getStockItems"]>[0];

async function getStockItems(ownerId: Params, datasources: Datasources) {
  const cached = cache.get<Array<Record<string, unknown>> | null>(
    CacheStringKeys.CACHE_STOCK_DATA,
    { uniqueId: ownerId },
  );

  let stockModel: StockModel[] = [];

  if (cached) {
    stockModel = cached.map((cache) => StockModel.fromJSON(cache));
  } else {
    stockModel = await datasources.stockDatasource.getStockItems(ownerId);
    cache.set<Record<string, unknown>[]>(
      CacheStringKeys.CACHE_STOCK_DATA,
      stockModel.map((stock) => stock.toJSON()),
      { uniqueId: ownerId },
    );
  }

  return stockModel.map((stock) => toStockEntity(stock));
}

export default getStockItems;
