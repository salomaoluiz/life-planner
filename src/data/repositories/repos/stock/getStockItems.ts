import { Datasources } from "@data/datasource";
import StockModel from "@data/models/stock/StockModel";
import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

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

  return stockModel.map(
    (stock) =>
      new StockEntity({
        barcode: stock.barcode,
        brand: stock.brand,
        description: stock.description,
        expirationDate: stock.expirationDate,
        id: stock.id,
        notes: stock.notes,
        openingDate: stock.openingDate,
        owner: stock.owner as StockOwners,
        ownerId: stock.ownerId,
        purchaseDate: stock.purchaseDate,
        quantity: stock.quantity,
        unit: stock.unit as StockUnits,
      }),
  );
}

export default getStockItems;
