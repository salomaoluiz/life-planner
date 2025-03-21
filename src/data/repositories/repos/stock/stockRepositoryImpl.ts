import { Datasources } from "@data/datasource";
import StockModel from "@data/models/stock/StockModel";
import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function stockRepositoryImpl(datasources: Datasources): StockRepository {
  return {
    async createStockItem(params): Promise<StockEntity> {
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
    },
    async deleteStockItem(params): Promise<void> {
      await datasources.stockDatasource.deleteStockItem(params.id);

      cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA, {
        uniqueId: params.ownerId,
      });
    },
    async getStockItems(ownerId: string): Promise<StockEntity[]> {
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
    },
    async updateStockItem(params): Promise<void> {
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
    },
  };
}

export default stockRepositoryImpl;
