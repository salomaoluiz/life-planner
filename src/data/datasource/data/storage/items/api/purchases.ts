import {
  parseClosedPurchase,
  parseClosePreview,
  parseItemPrices,
  parseListPurchases,
  parseMarket,
  parsePendingPurchases,
  parsePurchase,
  parsePurchaseRowResult,
  parsePurchaseView,
} from "@data/models/stock/PurchaseModels";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

const id_ = encodeURIComponent;

function keyed(clientId?: string): Record<string, string> | undefined {
  return clientId ? { "Idempotency-Key": clientId } : undefined;
}

// Spec 120 §7: markets, purchases, rows, closing and prices. Writes that can be queued carry the `Idempotency-Key`.
export const purchaseApiDatasource: Pick<
  StockDatasource,
  | "changePurchaseStatus"
  | "closePurchase"
  | "closingLock"
  | "createMarket"
  | "deleteClosedPurchase"
  | "deletePurchaseRow"
  | "getClosePreview"
  | "getItemPrices"
  | "getListPurchases"
  | "getMarkets"
  | "getPendingPurchases"
  | "getPurchase"
  | "mergePurchase"
  | "startPurchase"
  | "updateClosedPurchase"
  | "upsertPurchaseRow"
> = {
  async changePurchaseStatus({ action, clientId, id }) {
    try {
      return parsePurchase(
        await api.post<Record_>(
          `/v1/stock/purchases/${id_(id)}/${action.toLowerCase()}`,
          undefined,
          keyed(clientId),
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - changePurchaseStatus",
        id,
      });
    }
  },

  async closePurchase({ clientId, id, ...body }) {
    try {
      return parseClosedPurchase(
        await api.post<Record_>(
          `/v1/stock/purchases/${id_(id)}/close`,
          body,
          keyed(clientId),
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - closePurchase",
        id,
      });
    }
  },

  async closingLock({ id, release }) {
    try {
      if (release) {
        await api.delete(`/v1/stock/purchases/${id_(id)}/closing`);
      } else {
        await api.post(`/v1/stock/purchases/${id_(id)}/closing`);
      }
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - closingLock",
        id,
      });
    }
  },

  async createMarket(params) {
    try {
      return parseMarket(await api.post<Record_>("/v1/stock/markets", params));
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - createMarket",
        ownerId: params.ownerId,
      });
    }
  },

  async deleteClosedPurchase(id) {
    try {
      const data = await api.delete<{
        keptRows: Array<{ description: string; rowId: string }>;
      }>(`/v1/stock/purchases/${id_(id)}`);

      return data.keptRows ?? [];
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - deleteClosedPurchase",
        id,
      });
    }
  },

  async deletePurchaseRow({ clientId, purchaseId, rowId }) {
    try {
      await api.delete(
        `/v1/stock/purchases/${id_(purchaseId)}/rows/${id_(rowId)}`,
        undefined,
        keyed(clientId),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - deletePurchaseRow",
        purchaseId,
        rowId,
      });
    }
  },

  async getClosePreview({ id, receiptTotalCents }) {
    try {
      const query = receiptTotalCents
        ? `?receiptTotalCents=${receiptTotalCents}`
        : "";

      return parseClosePreview(
        await api.get<Record_>(
          `/v1/stock/purchases/${id_(id)}/close-preview${query}`,
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - getClosePreview",
        id,
      });
    }
  },

  async getItemPrices({ cursor, itemId, marketId }) {
    try {
      const query = new URLSearchParams();

      if (marketId) {
        query.set("marketId", marketId);
      }
      if (cursor) {
        query.set("cursor", cursor);
      }

      return parseItemPrices(
        await api.get<Record_>(
          `/v1/stock/items/${id_(itemId)}/prices${query.size ? `?${query}` : ""}`,
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - getItemPrices",
        itemId,
      });
    }
  },

  async getListPurchases({ closed, cursor, listId }) {
    try {
      const query = new URLSearchParams({
        status: closed ? "CLOSED" : "OPEN,ENDED",
      });

      if (cursor) {
        query.set("cursor", cursor);
      }

      return parseListPurchases(
        await api.get<Record_>(
          `/v1/stock/shopping-lists/${id_(listId)}/purchases?${query}`,
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - getListPurchases",
        listId,
      });
    }
  },

  async getMarkets({ ownerId }) {
    try {
      const data = await api.get<{ items: Record_[] }>(
        `/v1/stock/markets${ownerId ? `?ownerId=${id_(ownerId)}` : ""}`,
      );

      return data.items.map(parseMarket);
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - getMarkets",
        ownerId,
      });
    }
  },

  async getPendingPurchases() {
    try {
      return parsePendingPurchases(
        await api.get<Record_>("/v1/stock/purchases/pending"),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - getPendingPurchases",
      });
    }
  },

  async getPurchase(id) {
    try {
      return parsePurchaseView(
        await api.get<Record_>(`/v1/stock/purchases/${id_(id)}`),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - getPurchase",
        id,
      });
    }
  },

  async mergePurchase({ id, targetId }) {
    try {
      return parsePurchase(
        await api.post<Record_>(
          `/v1/stock/purchases/${id_(id)}/merge-into/${id_(targetId)}`,
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - mergePurchase",
        id,
      });
    }
  },

  async startPurchase(params) {
    try {
      return parsePurchase(
        await api.post<Record_>("/v1/stock/purchases", params),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - startPurchase",
        id: params.id,
      });
    }
  },

  async updateClosedPurchase({ id, ...body }) {
    try {
      return parsePurchase(
        await api.patch<Record_>(`/v1/stock/purchases/${id_(id)}`, body),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - updateClosedPurchase",
        id,
      });
    }
  },

  async upsertPurchaseRow({ clientId, purchaseId, rowId, ...body }) {
    try {
      return parsePurchaseRowResult(
        await api.put<Record_>(
          `/v1/stock/purchases/${id_(purchaseId)}/rows/${id_(rowId)}`,
          body,
          keyed(clientId),
        ),
      );
    } catch (error) {
      return handleStockApiError(error, {
        datasource: "StockDatasource - upsertPurchaseRow",
        purchaseId,
        rowId,
      });
    }
  },
};
