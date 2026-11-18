import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["getStockItem"]>[0];
export type Response = ReturnType<StockDatasource["getStockItem"]>;

// The detail: the item plus its lots. `today` is the device day, so expiration statuses follow the user's calendar.
async function getStockItem(id: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/stock/items/${encodeURIComponent(id)}?today=${formatDay(new Date())}`,
    );

    return StockModel.fromJSON(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getStockItem",
      id,
    });
  }
}

export default getStockItem;
