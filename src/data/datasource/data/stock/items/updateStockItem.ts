import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<StockDatasource["updateStockItem"]>[0];
export type Response = ReturnType<StockDatasource["updateStockItem"]>;

async function updateStockItem(params: Params): Response {
  try {
    const response = await supabase
      .from("storage")
      .upsert({
        barcode: params.barcode,
        brand: params.brand,
        description: params.description,
        expirationDate: params.expirationDate,
        notes: params.notes,
        openingDate: params.openingDate,
        owner: params.owner,
        ownerId: params.ownerId,
        purchaseDate: params.purchaseDate,
        quantity: params.quantity,
        unit: params.unit,
      })
      .eq("id", params.id)
      .select()
      .then();

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "StockDatasource - updateStockItem",
      error,
      params,
    });

    throw genericError;
  }
}

export default updateStockItem;
