import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["getStockItems"]>[0];
export type Response = ReturnType<StockDatasource["getStockItems"]>;

async function getStockItems(ownerId: Params): Response {
  // Without the filter the API would return every owner the user can access.
  if (!ownerId) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/stock/items?ownerId=${encodeURIComponent(ownerId)}`,
    );

    return data.map((item) => StockModel.fromJSON(item));
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getStockItems",
      ownerId,
    });
  }
}

export default getStockItems;
