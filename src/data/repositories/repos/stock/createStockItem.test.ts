import StockItemEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/createStockItem.mocks";

it("SHOULD create a transaction", async () => {
  await setup();

  expect(spies.stockItemDatasource.createStockItem).toHaveBeenCalledWith({
    barcode: mocks.transactionModel.barcode,
    brand: mocks.transactionModel.brand,
    description: mocks.transactionModel.description,
    expirationDate: mocks.transactionModel.expirationDate,
    notes: mocks.transactionModel.notes,
    openingDate: mocks.transactionModel.openingDate,
    owner: mocks.transactionModel.owner,
    ownerId: mocks.transactionModel.ownerId,
    purchaseDate: mocks.transactionModel.purchaseDate,
    quantity: mocks.transactionModel.quantity,
    unit: mocks.transactionModel.unit,
  });
});

it("SHOULD return a transaction created", async () => {
  const result = await setup();

  expect(result).toEqual(
    new StockItemEntity({
      barcode: mocks.transactionModel.barcode,
      brand: mocks.transactionModel.brand,
      description: mocks.transactionModel.description,
      expirationDate: mocks.transactionModel.expirationDate,
      id: mocks.transactionModel.id,
      notes: mocks.transactionModel.notes,
      openingDate: mocks.transactionModel.openingDate,
      owner: StockOwners[mocks.transactionModel.owner as never],
      ownerId: mocks.transactionModel.ownerId,
      purchaseDate: mocks.transactionModel.purchaseDate,
      quantity: mocks.transactionModel.quantity,
      unit: StockUnits[mocks.transactionModel.unit as never],
    }),
  );
});

it("SHOULD invalidate cache after transaction created", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    { uniqueId: mocks.defaultParams.ownerId },
  );
});
