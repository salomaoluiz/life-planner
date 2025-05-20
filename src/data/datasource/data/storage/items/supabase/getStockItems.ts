import StockModel from "@data/models/stock/StockModel";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<StockDatasource["getStockItems"]>[0];
export type Response = ReturnType<StockDatasource["getStockItems"]>;

async function getStockItems(ownerId: Params): Response {
  try {
    const response = await supabase
      .from("storage_items")
      .select()
      .eq("owner_id", ownerId)
      .then();

    if (response.error) {
      throw response.error;
    }

    return response.data.map((stock) => StockModel.fromJSON(stock));
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "StockDatasource - getStockItems",
      error,
      ownerId,
    });

    throw genericError;
  }
}

export default getStockItems;
