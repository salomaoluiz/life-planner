import {
  StockOwnerChangePreviewModel,
  StockSuggestionModel,
} from "@data/models/stock/StockCatalogModels";
import StockModel from "@data/models/stock/StockModel";
import StockMovementModel from "@data/models/stock/StockMovementModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

export async function createStockMovement(
  params: Parameters<StockDatasource["createStockMovement"]>[0],
): ReturnType<StockDatasource["createStockMovement"]> {
  try {
    const data = await api.post<{ item: Record_; movements: Record_[] }>(
      `/v1/stock/items/${encodeURIComponent(params.itemId)}/movements`,
      {
        countedQuantity: params.countedQuantity,
        expirationDate:
          params.expirationDate && formatDay(params.expirationDate),
        expiredLots: params.expiredLots,
        gestureId: params.gestureId,
        lotId: params.lotId,
        note: params.note,
        purchaseDate: params.purchaseDate && formatDay(params.purchaseDate),
        quantity: params.quantity,
        reason: params.reason,
        target: params.target,
        today: formatDay(new Date()),
        type: params.type,
      },
      params.clientId ? { "Idempotency-Key": params.clientId } : undefined,
    );

    return {
      item: StockModel.fromJSON(data.item),
      movements: data.movements.map((row) => StockMovementModel.fromJSON(row)),
    };
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createStockMovement",
      itemId: params.itemId,
    });
  }
}

export async function getOwnerChangePreview(
  params: Parameters<StockDatasource["getOwnerChangePreview"]>[0],
): Promise<StockOwnerChangePreviewModel> {
  try {
    const data = await api.get<Record_>(
      `/v1/stock/items/${encodeURIComponent(params.itemId)}/owner-change-preview?owner=${params.owner}&ownerId=${encodeURIComponent(params.ownerId)}`,
    );

    return StockOwnerChangePreviewModel.fromJSON(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getOwnerChangePreview",
      itemId: params.itemId,
    });
  }
}

export async function getStockMovements(
  params: Parameters<StockDatasource["getStockMovements"]>[0],
): ReturnType<StockDatasource["getStockMovements"]> {
  try {
    const query = params.cursor
      ? `?cursor=${encodeURIComponent(params.cursor)}`
      : "";
    const data = await api.get<{ items: Record_[]; nextCursor: null | string }>(
      `/v1/stock/items/${encodeURIComponent(params.itemId)}/movements${query}`,
    );

    return {
      items: data.items.map((row) => StockMovementModel.fromJSON(row)),
      nextCursor: data.nextCursor ?? undefined,
    };
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getStockMovements",
      itemId: params.itemId,
    });
  }
}

export async function suggestStockItems(
  params: Parameters<StockDatasource["suggestStockItems"]>[0],
): Promise<StockSuggestionModel[]> {
  try {
    const owner =
      params.owner && params.ownerId
        ? `owner=${params.owner}&ownerId=${encodeURIComponent(params.ownerId)}&`
        : "";
    const data = await api.get<{ items: Record_[] }>(
      `/v1/stock/items/suggestions?${owner}q=${encodeURIComponent(params.q)}`,
    );

    return data.items.map((row) => StockSuggestionModel.fromJSON(row));
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - suggestStockItems",
      ownerId: params.ownerId,
    });
  }
}
