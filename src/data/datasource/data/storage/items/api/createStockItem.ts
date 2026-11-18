import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["createStockItem"]>[0];
export type Response = ReturnType<StockDatasource["createStockItem"]>;

async function createStockItem(params: Params): Response {
  try {
    const data = await api.post<Record<string, unknown>>("/v1/stock/items", {
      barcode: params.barcode,
      brand: params.brand,
      categoryId: params.categoryId,
      description: params.description,
      expirationDate: params.expirationDate && formatDay(params.expirationDate),
      idealQuantity: params.idealQuantity,
      locationId: params.locationId,
      minQuantity: params.minQuantity,
      notes: params.notes,
      openedShelfLifeDays: params.openedShelfLifeDays,
      owner: params.owner,
      ownerId: params.ownerId,
      purchaseDate: params.purchaseDate && formatDay(params.purchaseDate),
      quantity: params.quantity,
      quickStep: params.quickStep,
      stockOnly: params.stockOnly,
      unit: params.unit,
      warnDaysClosed: params.warnDaysClosed,
      warnDaysOpened: params.warnDaysOpened,
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
