import {
  parseConsumptionWeeks,
  parseWaste,
} from "@data/models/stock/StockWasteModels";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

// Spec 123 FR 25: `dismissed: false` undoes the dismissal.
export async function dismissLeftover(
  params: Parameters<StockDatasource["dismissLeftover"]>[0],
): ReturnType<StockDatasource["dismissLeftover"]> {
  try {
    const path = `/v1/stock/lots/${encodeURIComponent(params.lotId)}/leftover-dismissal`;

    if (params.dismissed) {
      await api.post(path, {});
    } else {
      await api.delete(path);
    }
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - dismissLeftover",
    });
  }
}

export async function getConsumptionWeeks(
  params: Parameters<StockDatasource["getConsumptionWeeks"]>[0],
): ReturnType<StockDatasource["getConsumptionWeeks"]> {
  try {
    return parseConsumptionWeeks(
      await api.get<Record_>(
        `/v1/stock/items/${encodeURIComponent(params.itemId)}/consumption-weeks?today=${formatDay(new Date())}`,
      ),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getConsumptionWeeks",
      itemId: params.itemId,
    });
  }
}

export async function getWaste(
  params: Parameters<StockDatasource["getWaste"]>[0],
): ReturnType<StockDatasource["getWaste"]> {
  try {
    const query = new URLSearchParams();

    if (params.month) {
      query.set("month", params.month);
    }

    if (params.ownerId) {
      query.set("ownerId", params.ownerId);
    }

    if (params.all) {
      query.set("topLimit", "all");
    }

    const suffix = query.toString();

    return parseWaste(
      await api.get<Record_>(`/v1/stock/waste${suffix ? `?${suffix}` : ""}`),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getWaste",
      ownerId: params.ownerId,
    });
  }
}
