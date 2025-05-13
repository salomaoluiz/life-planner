import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateStockItem.mocks";

const updateStockItem = spies.stockDatasource.updateStockItem;

it("SHOULD update transaction AND invalidate cache WHEN called", async () => {
  await setup();

  expect(updateStockItem).toHaveBeenCalledTimes(1);
  expect(updateStockItem).toHaveBeenCalledWith({
    barcode: mocks.defaultParams.barcode,
    brand: mocks.defaultParams.brand,
    description: mocks.defaultParams.description,
    expirationDate: mocks.defaultParams.expirationDate,
    id: mocks.defaultParams.id,
    notes: mocks.defaultParams.notes,
    openingDate: mocks.defaultParams.openingDate,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    purchaseDate: mocks.defaultParams.purchaseDate,
    quantity: mocks.defaultParams.quantity,
    unit: mocks.defaultParams.unit,
  });

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    {
      uniqueId: mocks.defaultParams.ownerId,
    },
  );
});
