import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["deleteStockItem"]>[0];
export type Response = ReturnType<StockDatasource["deleteStockItem"]>;

async function deleteStockItem(id: Params): Response {
  try {
    // The API authorizes through the JWT: only the item id travels.
    await api.delete(`/v1/stock/items/${encodeURIComponent(id)}`);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - deleteStockItem",
      id,
    });
  }
}

export default deleteStockItem;
