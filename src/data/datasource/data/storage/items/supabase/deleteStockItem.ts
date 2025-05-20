import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<StockDatasource["deleteStockItem"]>[0];
export type Response = ReturnType<StockDatasource["deleteStockItem"]>;

async function deleteStockItem(id: Params): Response {
  try {
    const response = await supabase
      .from("storage_items")
      .delete()
      .eq("id", id)
      .then();

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "StockDatasource - deleteStockItem",
      error,
      id,
    });

    throw genericError;
  }
}

export default deleteStockItem;
