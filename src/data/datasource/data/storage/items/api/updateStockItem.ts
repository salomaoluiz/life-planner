import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

export type Params = Parameters<StockDatasource["updateStockItem"]>[0];
export type Response = ReturnType<StockDatasource["updateStockItem"]>;

async function updateStockItem(params: Params): Response {
  try {
    // `undefined` leaves the field alone, `null` clears it. Quantity and lot dates are not editable here.
    const body = {
      barcode: params.barcode,
      brand: params.brand,
      categoryId: params.categoryId,
      description: params.description,
      idealQuantity: params.idealQuantity,
      locationId: params.locationId,
      minQuantity: params.minQuantity,
      notes: params.notes,
      openedShelfLifeDays: params.openedShelfLifeDays,
      quickStep: params.quickStep,
      stockOnly: params.stockOnly,
      unit: params.unit,
      warnDaysClosed: params.warnDaysClosed,
      warnDaysOpened: params.warnDaysOpened,
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
