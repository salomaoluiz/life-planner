import {
  StockCategoryModel,
  StockLocationModel,
} from "@data/models/stock/StockCatalogModels";
import { StockCatalogStatus } from "@domain/entities/stock/StockCatalogEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, spies } from "./mocks/stock.mocks";
import {
  createStockCategory,
  createStockCategorySuggestions,
  createStockLocation,
  createStockLocationSuggestions,
  deleteStockCategory,
  deleteStockLocation,
  getStockCategories,
  getStockLocations,
  updateStockCategory,
  updateStockLocation,
} from "./stockCatalog";

const owner = { owner: "USER", ownerId: "u" };

it("SHOULD map the category tree (children included) and the locations", async () => {
  spies.datasource.getStockCategories.mockResolvedValue([
    new StockCategoryModel(
      "p",
      "Dairy",
      "ACTIVE",
      1,
      [
        new StockCategoryModel(
          "c",
          "Cheese",
          "ARCHIVED",
          2,
          [],
          "#60A5FA",
          "cup",
          "USER",
          "u",
          "p",
          "f",
          "f",
        ),
      ],
      "#3B82F6",
      "cup",
      "USER",
      "u",
    ),
  ]);
  spies.datasource.getStockLocations.mockResolvedValue([
    new StockLocationModel(
      "l",
      "Pantry",
      "ACTIVE",
      3,
      [
        new StockLocationModel(
          "s",
          "Shelf",
          "ACTIVE",
          1,
          [],
          "#111111",
          "archive",
          "USER",
          "u",
          "l",
        ),
      ],
      "#F59E0B",
      "archive",
      "USER",
      "u",
    ),
  ]);

  const categories = await getStockCategories(owner, mocks.datasources);
  const locations = await getStockLocations(owner, mocks.datasources);

  expect(categories[0].children[0]).toMatchObject({
    effectiveFinanceCategoryId: "f",
    status: StockCatalogStatus.ARCHIVED,
  });
  expect(categories[0]).toMatchObject({
    color: "#3B82F6",
    icon: "cup",
    ownerId: "u",
  });
  expect(locations[0]).toMatchObject({
    color: "#F59E0B",
    itemCount: 3,
    name: "Pantry",
  });
  expect(locations[0].children[0]).toMatchObject({
    name: "Shelf",
    parentId: "l",
  });
});

it("SHOULD pass creates and suggestions through WITHOUT touching the item cache", async () => {
  const look = { color: "#112233", icon: "cart" };

  await createStockCategory(
    { ...owner, ...look, name: "A" },
    mocks.datasources,
  );
  await createStockLocation(
    { ...owner, ...look, name: "B" },
    mocks.datasources,
  );
  await createStockCategorySuggestions(owner, mocks.datasources);
  await createStockLocationSuggestions(owner, mocks.datasources);

  expect(spies.datasource.createStockCategory).toHaveBeenCalledWith({
    ...owner,
    ...look,
    name: "A",
  });
  expect(spies.datasource.createStockLocation).toHaveBeenCalledWith({
    ...owner,
    ...look,
    name: "B",
  });
  expect(spies.datasource.createStockCategorySuggestions).toHaveBeenCalledWith(
    owner,
  );
  expect(spies.datasource.createStockLocationSuggestions).toHaveBeenCalledWith(
    owner,
  );
  expect(spies.cache.invalidate).not.toHaveBeenCalled();
});

it("SHOULD refresh every cached item list WHEN a category or location is renamed, archived or deleted", async () => {
  await updateStockCategory({ id: "c", name: "N" }, mocks.datasources);
  await updateStockLocation({ id: "l", status: "ARCHIVED" }, mocks.datasources);
  await deleteStockCategory({ id: "c", moveTo: "o" }, mocks.datasources);
  await deleteStockLocation({ id: "l" }, mocks.datasources);

  expect(spies.datasource.updateStockCategory).toHaveBeenCalledWith({
    id: "c",
    name: "N",
  });
  expect(spies.datasource.deleteStockCategory).toHaveBeenCalledWith("c", "o");
  expect(spies.datasource.deleteStockLocation).toHaveBeenCalledWith(
    "l",
    undefined,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledTimes(4);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_STOCK_DATA,
  );
});
