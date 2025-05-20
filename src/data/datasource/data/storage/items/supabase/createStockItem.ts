import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<StockDatasource["createStockItem"]>[0];
export type Response = ReturnType<StockDatasource["createStockItem"]>;

async function createStockItem(params: Params): Response {
  try {
    const response = await supabase
      .from("storage_items")
      .upsert({
        barcode: params.barcode,
        brand: params.brand,
        description: params.description,
        expiration_date: params.expirationDate,
        notes: params.notes,
        opening_date: params.openingDate,
        owner: params.owner,
        owner_id: params.ownerId,
        purchase_date: params.purchaseDate,
        quantity: params.quantity,
        unit: params.unit,
      })
      .select()
      .then();

    if (response.error) {
      throw response.error;
    }

    return StockModel.fromJSON(response.data[0]);
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "StockDatasource - createStockItem",
      error,
      params,
    });

    throw genericError;
  }
}

export default createStockItem;
