import {
  parseRestockSummary,
  parseShoppingList,
  parseShoppingListCard,
  parseShoppingListDetail,
  parseShoppingListRow,
  parseShoppingListRowResult,
} from "@data/models/stock/ShoppingListModels";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

export async function addShoppingListRow(
  params: Parameters<StockDatasource["addShoppingListRow"]>[0],
): ReturnType<StockDatasource["addShoppingListRow"]> {
  try {
    const { listId, ...body } = params;
    const data = await api.post<Record_>(
      `/v1/stock/shopping-lists/${encodeURIComponent(listId)}/rows`,
      body,
    );

    return parseShoppingListRowResult(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - addShoppingListRow",
      listId: params.listId,
    });
  }
}

export async function createShoppingList(
  params: Parameters<StockDatasource["createShoppingList"]>[0],
): ReturnType<StockDatasource["createShoppingList"]> {
  try {
    return parseShoppingList(
      await api.post<Record_>("/v1/stock/shopping-lists", params),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createShoppingList",
      ownerId: params.ownerId,
    });
  }
}

export async function deleteShoppingListRow(rowId: string): Promise<void> {
  try {
    await api.delete(
      `/v1/stock/shopping-lists/rows/${encodeURIComponent(rowId)}`,
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - deleteShoppingListRow",
      rowId,
    });
  }
}

export async function getRestockSummary(): ReturnType<
  StockDatasource["getRestockSummary"]
> {
  try {
    return parseRestockSummary(
      await api.get<Record_>("/v1/stock/shopping-lists/restock-summary"),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getRestockSummary",
    });
  }
}

export async function getShoppingList(
  id: string,
): ReturnType<StockDatasource["getShoppingList"]> {
  try {
    return parseShoppingListDetail(
      await api.get<Record_>(
        `/v1/stock/shopping-lists/${encodeURIComponent(id)}`,
      ),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getShoppingList",
      id,
    });
  }
}

export async function getShoppingLists(
  params: Parameters<StockDatasource["getShoppingLists"]>[0],
): ReturnType<StockDatasource["getShoppingLists"]> {
  try {
    const query = new URLSearchParams();

    if (params.ownerId) {
      query.set("ownerId", params.ownerId);
    }
    if (params.includeArchived) {
      query.set("includeArchived", "true");
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const data = await api.get<{ items: Record_[] }>(
      `/v1/stock/shopping-lists${suffix}`,
    );

    return data.items.map((row) => parseShoppingListCard(row));
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getShoppingLists",
      ownerId: params.ownerId,
    });
  }
}

export async function updateShoppingList(
  params: Parameters<StockDatasource["updateShoppingList"]>[0],
): ReturnType<StockDatasource["updateShoppingList"]> {
  try {
    const { id, ...body } = params;

    return parseShoppingList(
      await api.patch<Record_>(
        `/v1/stock/shopping-lists/${encodeURIComponent(id)}`,
        body,
      ),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - updateShoppingList",
      id: params.id,
    });
  }
}

export async function updateShoppingListRow(
  params: Parameters<StockDatasource["updateShoppingListRow"]>[0],
): ReturnType<StockDatasource["updateShoppingListRow"]> {
  try {
    const { id, ...body } = params;

    return parseShoppingListRow(
      await api.patch<Record_>(
        `/v1/stock/shopping-lists/rows/${encodeURIComponent(id)}`,
        body,
      ),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - updateShoppingListRow",
      id: params.id,
    });
  }
}
