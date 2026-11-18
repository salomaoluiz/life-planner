import { StockLocationDetailModel } from "@data/models/stock/StockCatalogModels";
import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

export async function getFrequentStockItems(
  limit?: number,
): ReturnType<StockDatasource["getFrequentStockItems"]> {
  try {
    const query = limit ? `?limit=${limit}` : "";
    const data = await api.get<{ items: Record_[] }>(
      `/v1/stock/items/frequent${query}`,
    );

    return data.items.map((row) => StockModel.fromJSON(row));
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getFrequentStockItems",
    });
  }
}

export async function getStockLocation(
  id: string,
): ReturnType<StockDatasource["getStockLocation"]> {
  try {
    const data = await api.get<Record_>(
      `/v1/stock/locations/${encodeURIComponent(id)}`,
    );

    return StockLocationDetailModel.fromJSON(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getStockLocation",
      id,
    });
  }
}

export async function setStockGestureExpiration(
  params: Parameters<StockDatasource["setStockGestureExpiration"]>[0],
): ReturnType<StockDatasource["setStockGestureExpiration"]> {
  try {
    const data = await api.post<{ item: Record_ }>(
      `/v1/stock/movements/${encodeURIComponent(params.gestureId)}/expiration`,
      {
        expirationDate: formatDay(params.expirationDate),
        today: formatDay(new Date()),
      },
      keyHeader(params.clientId),
    );

    return StockModel.fromJSON(data.item);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - setStockGestureExpiration",
      gestureId: params.gestureId,
    });
  }
}

export async function undoStockGesture(
  params: Parameters<StockDatasource["undoStockGesture"]>[0],
): ReturnType<StockDatasource["undoStockGesture"]> {
  try {
    const data = await api.post<{ item: Record_ }>(
      "/v1/stock/movements/undo",
      { gestureId: params.gestureId },
      keyHeader(params.clientId),
    );

    return StockModel.fromJSON(data.item);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - undoStockGesture",
      gestureId: params.gestureId,
    });
  }
}

function keyHeader(clientId?: string) {
  return clientId ? { "Idempotency-Key": clientId } : undefined;
}
