import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/getStockItems.mocks";

it("SHOULD NOT call cache.set and datasource if has cached data", async () => {
  spies.cache.get.mockReturnValue([mocks.firstStockItem.toJSON()]);

  await setup();

  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(spies.stockDatasource.getStockItems).not.toHaveBeenCalled();
});

it("SHOULD return stock items from cache", async () => {
  spies.cache.get.mockReturnValue([mocks.firstStockItem.toJSON()]);

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    { uniqueId: mocks.defaultParams },
  );
  expect(result).toEqual([
    new StockEntity({
      barcode: mocks.firstStockItem.barcode,
      brand: mocks.firstStockItem.brand,
      description: mocks.firstStockItem.description,
      expirationDate: mocks.firstStockItem.expirationDate,
      id: mocks.firstStockItem.id,
      notes: mocks.firstStockItem.notes,
      openingDate: mocks.firstStockItem.openingDate,
      owner: StockOwners.FAMILY,
      ownerId: mocks.firstStockItem.ownerId,
      purchaseDate: mocks.firstStockItem.purchaseDate,
      quantity: mocks.firstStockItem.quantity,
      unit: StockUnits.GRAM,
    }),
  ]);
});

it("SHOULD call cache.set and datasource if has no cached data", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.stockDatasource.getStockItems.mockResolvedValueOnce([
    mocks.firstStockItem,
    mocks.secondStockItem,
  ]);

  await setup();

  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    [mocks.firstStockItem.toJSON(), mocks.secondStockItem.toJSON()],
    { uniqueId: mocks.defaultParams },
  );
  expect(spies.stockDatasource.getStockItems).toHaveBeenCalledTimes(1);
  expect(spies.stockDatasource.getStockItems).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD return stock items from datasource", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.stockDatasource.getStockItems.mockResolvedValueOnce([
    mocks.secondStockItem,
  ]);

  const result = await setup();

  expect(result).toEqual([
    new StockEntity({
      barcode: mocks.secondStockItem.barcode,
      brand: mocks.secondStockItem.brand,
      description: mocks.secondStockItem.description,
      expirationDate: mocks.secondStockItem.expirationDate,
      id: mocks.secondStockItem.id,
      notes: mocks.secondStockItem.notes,
      openingDate: mocks.secondStockItem.openingDate,
      owner: StockOwners.FAMILY,
      ownerId: mocks.secondStockItem.ownerId,
      purchaseDate: mocks.secondStockItem.purchaseDate,
      quantity: mocks.secondStockItem.quantity,
      unit: StockUnits.GRAM,
    }),
  ]);
});
