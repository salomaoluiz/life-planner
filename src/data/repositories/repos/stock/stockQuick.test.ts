import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, spies } from "./mocks/stock.mocks";
import {
  getFrequentStockItems,
  getStockLocation,
  setStockGestureExpiration,
  undoStockGesture,
} from "./stockQuick";

it("SHOULD map the frequent items", async () => {
  spies.datasource.getFrequentStockItems.mockResolvedValue([mocks.listModel]);

  const rows = await getFrequentStockItems(5, mocks.datasources);

  expect(spies.datasource.getFrequentStockItems).toHaveBeenCalledWith(5);
  expect(rows[0].id).toBe(mocks.listModel.id);
});

it("SHOULD map the location", async () => {
  spies.datasource.getStockLocation.mockResolvedValue({
    id: "l",
    itemCount: 2,
    name: "Pantry",
    owner: "USER",
    ownerId: "o",
    status: "ACTIVE",
  });

  expect(await getStockLocation("l", mocks.datasources)).toMatchObject({
    itemCount: 2,
    status: "ACTIVE",
  });
});

it("SHOULD undo and re-date a gesture WITHOUT the owner id AND invalidate the owner list", async () => {
  spies.datasource.undoStockGesture.mockResolvedValue(mocks.detailModel);
  spies.datasource.setStockGestureExpiration.mockResolvedValue(
    mocks.detailModel,
  );

  await undoStockGesture(
    { gestureId: "g", ownerId: "owner" },
    mocks.datasources,
  );
  await setStockGestureExpiration(
    { expirationDate: new Date(2026, 11, 5), gestureId: "g", ownerId: "owner" },
    mocks.datasources,
  );

  expect(spies.datasource.undoStockGesture).toHaveBeenCalledWith({
    gestureId: "g",
  });
  expect(spies.cache.invalidate).toHaveBeenCalledTimes(2);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    { uniqueId: "owner" },
  );
});
