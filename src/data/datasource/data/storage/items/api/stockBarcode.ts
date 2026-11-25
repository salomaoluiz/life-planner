import {
  AiUsageModel,
  ItemSuggestionModel,
  StockBarcodeLookupModel,
} from "@data/models/stock/StockBarcodeModels";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

export async function getAiUsage(): ReturnType<StockDatasource["getAiUsage"]> {
  try {
    return AiUsageModel.fromJSON(
      await api.get<Record_>("/v1/stock/item-suggestions/usage"),
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getAiUsage",
    });
  }
}

export async function lookupStockBarcode(
  code: string,
): ReturnType<StockDatasource["lookupStockBarcode"]> {
  try {
    const data = await api.get<Record_>(
      `/v1/stock/barcodes/${encodeURIComponent(code)}?today=${formatDay(new Date())}`,
    );

    return StockBarcodeLookupModel.fromJSON(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - lookupStockBarcode",
    });
  }
}

export async function suggestStockItem(
  params: Parameters<StockDatasource["suggestStockItem"]>[0],
): ReturnType<StockDatasource["suggestStockItem"]> {
  try {
    const data = await api.post<Record_>("/v1/stock/item-suggestions", {
      barcode: params.barcode,
      name: params.name,
      owner: params.owner,
      ownerId: params.ownerId,
    });

    return ItemSuggestionModel.fromJSON(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - suggestStockItem",
      ownerId: params.ownerId,
    });
  }
}
