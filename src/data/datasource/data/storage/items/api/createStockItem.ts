import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["createStockItem"]>[0];
export type Response = ReturnType<StockDatasource["createStockItem"]>;

async function createStockItem(params: Params): Response {
  try {
    const data = await api.post<Record<string, unknown>>("/v1/stock/items", {
      barcode: params.barcode,
      brand: params.brand,
      description: params.description,
      expirationDate: params.expirationDate?.toISOString(),
      notes: params.notes,
      openingDate: params.openingDate?.toISOString(),
      owner: params.owner,
      ownerId: params.ownerId,
      purchaseDate: params.purchaseDate?.toISOString(),
      quantity: params.quantity,
      unit: params.unit,
    });

    return StockModel.fromJSON(data);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createStockItem",
      ownerId: params.ownerId,
    });
  }
}

export default createStockItem;
