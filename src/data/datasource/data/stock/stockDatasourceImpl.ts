import StockModel from "@data/models/stock/StockModel";
import {
  CreateStockDatasourceParams,
  StockDatasource,
  UpdateStockDatasourceParams,
} from "@data/repositories/repos/stock/stockDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

function stockDatasourceImpl(): StockDatasource {
  return {
    async createStockItem(
      params: CreateStockDatasourceParams,
    ): Promise<StockModel> {
      try {
        const response = await supabase
          .from("storage")
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
          error,
          params,
        });

        throw genericError;
      }
    },
    async deleteStockItem(id: string): Promise<void> {
      try {
        const response = await supabase
          .from("storage")
          .delete()
          .eq("id", id)
          .then();

        if (response.error) {
          throw response.error;
        }
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          id,
        });

        throw genericError;
      }
    },
    async getStockItems(ownerId: string): Promise<StockModel[]> {
      try {
        const response = await supabase
          .from("storage")
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
          error,
          ownerId,
        });

        throw genericError;
      }
    },
    async updateStockItem(params: UpdateStockDatasourceParams): Promise<void> {
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
          error,
          params,
        });

        throw genericError;
      }
    },
  };
}

export default stockDatasourceImpl;
