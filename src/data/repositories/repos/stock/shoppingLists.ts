import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";

// Spec 118: the lists screens read through React Query, so these only forward to the API datasource.
export async function addShoppingListRow(
  params: Parameters<StockRepository["addShoppingListRow"]>[0],
  datasources: Datasources,
) {
  return datasources.stockDatasource.addShoppingListRow(params);
}

export async function createShoppingList(
  params: Parameters<StockRepository["createShoppingList"]>[0],
  datasources: Datasources,
) {
  return datasources.stockDatasource.createShoppingList(params);
}

export async function deleteShoppingListRow(
  rowId: string,
  datasources: Datasources,
) {
  return datasources.stockDatasource.deleteShoppingListRow(rowId);
}

export async function getRestockSummary(datasources: Datasources) {
  return datasources.stockDatasource.getRestockSummary();
}

export async function getShoppingList(id: string, datasources: Datasources) {
  return datasources.stockDatasource.getShoppingList(id);
}

export async function getShoppingLists(
  params: Parameters<StockRepository["getShoppingLists"]>[0],
  datasources: Datasources,
) {
  return datasources.stockDatasource.getShoppingLists(params);
}

export async function updateShoppingList(
  params: Parameters<StockRepository["updateShoppingList"]>[0],
  datasources: Datasources,
) {
  return datasources.stockDatasource.updateShoppingList(params);
}

export async function updateShoppingListRow(
  params: Parameters<StockRepository["updateShoppingListRow"]>[0],
  datasources: Datasources,
) {
  return datasources.stockDatasource.updateShoppingListRow(params);
}
