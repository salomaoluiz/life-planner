import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, spies } from "./mocks/stock.mocks";
import {
  createStockMovement,
  getOwnerChangePreview,
  getStockMovements,
  suggestStockItems,
} from "./stockMovements";

it("SHOULD create the movement WITHOUT the owner id (it only keys the cache) AND invalidate the list", async () => {
  spies.datasource.createStockMovement.mockResolvedValue({
    item: mocks.detailModel,
    movements: [mocks.movementModel],
  });

  const result = await createStockMovement(
    { itemId: "i", ownerId: "owner", quantity: 1, type: "ENTRY" },
    mocks.datasources,
  );

  expect(spies.datasource.createStockMovement).toHaveBeenCalledWith({
    itemId: "i",
    quantity: 1,
    type: "ENTRY",
  });
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
    { uniqueId: "owner" },
  );
  expect(result.item.id).toBe(mocks.detailModel.id);
  expect(result.movements[0]).toMatchObject({
    id: "m",
    type: StockMovementTypes.ENTRY,
  });
});

it("SHOULD map a page of the history", async () => {
  spies.datasource.getStockMovements.mockResolvedValue({
    items: [mocks.movementModel],
    nextCursor: "next",
  });

  const page = await getStockMovements({ itemId: "i" }, mocks.datasources);

  expect(spies.datasource.getStockMovements).toHaveBeenCalledWith({
    itemId: "i",
  });
  expect(page).toMatchObject({ nextCursor: "next" });
  expect(page.items).toHaveLength(1);
});

it("SHOULD pass the preview and the suggestions through", async () => {
  const preview = { category: { from: "Dairy" }, location: {} };

  spies.datasource.getOwnerChangePreview.mockResolvedValue(preview as never);
  spies.datasource.suggestStockItems.mockResolvedValue([
    {
      description: "Milk",
      id: "s",
      quantity: 1,
      score: 1,
      unit: "liter",
    } as never,
  ]);

  expect(
    await getOwnerChangePreview(
      { itemId: "i", owner: "USER", ownerId: "u" },
      mocks.datasources,
    ),
  ).toBe(preview);
  expect(
    await suggestStockItems(
      { owner: "USER", ownerId: "u", q: "mi" },
      mocks.datasources,
    ),
  ).toEqual([
    { description: "Milk", id: "s", quantity: 1, score: 1, unit: "liter" },
  ]);
});
