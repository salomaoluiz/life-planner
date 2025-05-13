import { Datasources } from "@data/datasource";
import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<StockRepository["createStockItem"]>[0];

async function createStockItem(params: Params, datasources: Datasources) {
  const stock = await datasources.stockDatasource.createStockItem({
    barcode: params.barcode,
    brand: params.brand,
    description: params.description,
    expirationDate: params.expirationDate,
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

  return new StockEntity({
    barcode: stock.barcode,
    brand: stock.brand,
    description: stock.description,
    expirationDate: stock.expirationDate,
    id: stock.id,
    notes: stock.notes,
    openingDate: stock.openingDate,
    owner: StockOwners[stock.owner as keyof typeof StockOwners],
    ownerId: stock.ownerId,
    purchaseDate: stock.purchaseDate,
    quantity: stock.quantity,
    unit: StockUnits[stock.unit as keyof typeof StockUnits],
  });
}

export default createStockItem;
