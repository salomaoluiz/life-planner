import { Datasources } from "@data/datasource";
import {
  StockCategoryModel,
  StockLocationModel,
} from "@data/models/stock/StockCatalogModels";
import {
  StockCatalogStatus,
  StockCategoryEntity,
  StockLocationEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import { StockRepository } from "@domain/repositories/stock";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export async function createStockCategory(
  params: Parameters<StockRepository["createStockCategory"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.createStockCategory(params);
}

export async function createStockCategorySuggestions(
  params: Parameters<StockRepository["createStockCategorySuggestions"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.createStockCategorySuggestions(params);
}

export async function createStockLocation(
  params: Parameters<StockRepository["createStockLocation"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.createStockLocation(params);
}

export async function createStockLocationSuggestions(
  params: Parameters<StockRepository["createStockLocationSuggestions"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.createStockLocationSuggestions(params);
}

export async function deleteStockCategory(
  params: Parameters<StockRepository["deleteStockCategory"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.deleteStockCategory(params.id);
  invalidateItems();
}

export async function deleteStockLocation(
  params: Parameters<StockRepository["deleteStockLocation"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.deleteStockLocation(params.id);
  invalidateItems();
}

export async function getStockCategories(
  params: Parameters<StockRepository["getStockCategories"]>[0],
  datasources: Datasources,
) {
  const rows = await datasources.stockDatasource.getStockCategories(params);

  return rows.map((row) => toCategory(row));
}

export async function getStockLocations(
  params: Parameters<StockRepository["getStockLocations"]>[0],
  datasources: Datasources,
) {
  const rows = await datasources.stockDatasource.getStockLocations(params);

  return rows.map((row) => toLocation(row));
}

export async function updateStockCategory(
  params: Parameters<StockRepository["updateStockCategory"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.updateStockCategory(params);
  invalidateItems();
}

export async function updateStockLocation(
  params: Parameters<StockRepository["updateStockLocation"]>[0],
  datasources: Datasources,
) {
  await datasources.stockDatasource.updateStockLocation(params);
  invalidateItems();
}

// Items carry their category and location names: a catalog write refreshes every cached list.
function invalidateItems() {
  cache.invalidate(CacheStringKeys.CACHE_STOCK_DATA);
}

function toCategory(model: StockCategoryModel): StockCategoryEntity {
  return new StockCategoryEntity({
    children: model.children.map((child) => toCategory(child)),
    effectiveFinanceCategoryId: model.effectiveFinanceCategoryId,
    financeCategoryId: model.financeCategoryId,
    id: model.id,
    itemCount: model.itemCount,
    name: model.name,
    parentId: model.parentId,
    status: model.status as StockCatalogStatus,
  });
}

function toLocation(model: StockLocationModel): StockLocationEntity {
  return new StockLocationEntity({
    id: model.id,
    itemCount: model.itemCount,
    name: model.name,
    status: model.status as StockCatalogStatus,
  });
}
