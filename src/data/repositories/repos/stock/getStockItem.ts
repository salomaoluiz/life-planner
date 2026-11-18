import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";

import { toStockEntity } from "./toStockEntity";

export type Params = Parameters<StockRepository["getStockItem"]>[0];

// The detail (lots included) is never cached: movements change it on every write.
async function getStockItem(id: Params, datasources: Datasources) {
  return toStockEntity(await datasources.stockDatasource.getStockItem(id));
}

export default getStockItem;
