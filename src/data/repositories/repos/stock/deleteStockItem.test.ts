import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/deleteStockItem.mocks";

it("SHOULD delete a stock item AND invalidate cache WHEN called", async () => {
  await setup();

  expect(spies.stockDatasource.deleteStockItem).toHaveBeenCalledWith(
    mocks.defaultParams.id,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    {
      uniqueId: mocks.defaultParams.ownerId,
    },
  );
  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
});
