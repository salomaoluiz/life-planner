import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import createStockItem from "./createStockItem";
import deleteStockItem from "./deleteStockItem";
import getStockItem from "./getStockItem";
import getStockItems from "./getStockItems";
import { mocks, spies } from "./mocks/stock.mocks";
import updateStockItem from "./updateStockItem";

const OWNER = "40351436-c148-49bf-9235-dd68fae9647e";
const createParams = {
  description: "Rice",
  owner: "USER",
  ownerId: OWNER,
  quantity: 2,
  stockOnly: false,
  unit: "kilogram",
  warnDaysClosed: 7,
  warnDaysOpened: 1,
};

describe("getStockItems", () => {
  it("SHOULD read the datasource AND cache the list shape WHEN nothing is cached", async () => {
    spies.datasource.getStockItems.mockResolvedValue([mocks.listModel]);

    const result = await getStockItems(OWNER, mocks.datasources);

    expect(spies.datasource.getStockItems).toHaveBeenCalledWith(OWNER);
    expect(spies.cache.set).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_STOCK_DATA,
      [mocks.listModel.toJSON()],
      { uniqueId: OWNER },
    );
    expect(result[0]).toBeInstanceOf(StockEntity);
    expect(result[0]).toMatchObject({
      expirationStatus: "EXPIRING",
      needsRestock: false,
      owner: StockOwners.FAMILY,
      unit: StockUnits.KILOGRAM,
    });
  });

  it("SHOULD NOT touch the datasource WHEN the list is cached", async () => {
    spies.cache.get.mockReturnValue([mocks.listModel.toJSON()]);

    const result = await getStockItems(OWNER, mocks.datasources);

    expect(spies.datasource.getStockItems).not.toHaveBeenCalled();
    expect(spies.cache.set).not.toHaveBeenCalled();
    expect(result[0].id).toBe(mocks.listModel.id);
  });
});

describe("getStockItem", () => {
  it("SHOULD return the detail with its lots AND never cache it", async () => {
    spies.datasource.getStockItem.mockResolvedValue(mocks.detailModel);

    const result = await getStockItem("item-id", mocks.datasources);

    expect(spies.datasource.getStockItem).toHaveBeenCalledWith("item-id");
    expect(result.lots).toHaveLength(1);
    expect(result.lots[0]).toMatchObject({
      expirationStatus: "EXPIRING",
      quantity: 1.5,
    });
    expect(spies.cache.set).not.toHaveBeenCalled();
  });

  it("SHOULD map an item without lots to an empty list", async () => {
    spies.datasource.getStockItem.mockResolvedValue(mocks.minimalModel);

    expect((await getStockItem("i", mocks.datasources)).lots).toEqual([]);
  });
});

describe("createStockItem", () => {
  it("SHOULD create AND invalidate the list of the owner", async () => {
    spies.datasource.createStockItem.mockResolvedValue(mocks.detailModel);

    const result = await createStockItem(createParams, mocks.datasources);

    expect(spies.datasource.createStockItem).toHaveBeenCalledWith(createParams);
    expect(spies.cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_STOCK_DATA,
      { uniqueId: OWNER },
    );
    expect(result.id).toBe(mocks.detailModel.id);
  });
});

describe("updateStockItem", () => {
  it("SHOULD invalidate the list of the owner the item was in AND the new one WHEN it moves", async () => {
    await updateStockItem(
      { id: "i", owner: "FAMILY", ownerId: "family", previousOwnerId: "user" },
      mocks.datasources,
    );

    expect(spies.datasource.updateStockItem).toHaveBeenCalledWith({
      id: "i",
      owner: "FAMILY",
      ownerId: "family",
    });
    expect(spies.cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_STOCK_DATA,
      { uniqueId: "user" },
    );
    expect(spies.cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_STOCK_DATA,
      { uniqueId: "family" },
    );
  });

  it("SHOULD invalidate only the current owner WHEN the item stays", async () => {
    await updateStockItem(
      { description: "x", id: "i", previousOwnerId: "user" },
      mocks.datasources,
    );

    expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  });
});

describe("deleteStockItem", () => {
  it("SHOULD delete AND invalidate the list of the owner", async () => {
    await deleteStockItem({ id: "i", ownerId: OWNER }, mocks.datasources);

    expect(spies.datasource.deleteStockItem).toHaveBeenCalledWith("i");
    expect(spies.cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_STOCK_DATA,
      { uniqueId: OWNER },
    );
  });
});
