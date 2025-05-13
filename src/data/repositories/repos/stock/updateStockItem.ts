import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<StockRepository["updateStockItem"]>[0];

async function updateStockItem(params: Params, datasources: Datasources) {
  await datasources.stockDatasource.updateStockItem({
    barcode: params.barcode,
    brand: params.brand,
    description: params.description,
    expirationDate: params.expirationDate,
    id: params.id,
    notes: params.notes,
    openingDate: params.openingDate,
    owner: params.owner,
    ownerId: params.ownerId,
    purchaseDate: params.purchaseDate,
    quantity: params.quantity,
    unit: params.unit,
  });

  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, {
    uniqueId: params.ownerId,
  });
}

export default updateStockItem;
