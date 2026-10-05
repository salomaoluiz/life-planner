import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["updateStockItem"]>[0];
export type Response = ReturnType<StockDatasource["updateStockItem"]>;

async function updateStockItem(params: Params): Response {
  try {
    const body = {
      barcode: params.barcode,
      brand: params.brand,
      description: params.description,
      expirationDate: params.expirationDate?.toISOString(),
      notes: params.notes,
      openingDate: params.openingDate?.toISOString(),
      purchaseDate: params.purchaseDate?.toISOString(),
      quantity: params.quantity,
      unit: params.unit,
      // The API moves an item only when owner and ownerId travel together.
      ...(params.owner !== undefined &&
        params.ownerId !== undefined && {
          owner: params.owner,
          ownerId: params.ownerId,
        }),
    };

    if (Object.values(body).every((value) => value === undefined)) {
      return;
    }

    await api.patch(`/v1/stock/items/${encodeURIComponent(params.id)}`, body);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - updateStockItem",
      id: params.id,
    });
  }
}

export default updateStockItem;
