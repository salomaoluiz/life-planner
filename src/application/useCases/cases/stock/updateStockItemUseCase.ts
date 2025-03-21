import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface UpdateStockItemUseCaseParams {
  barcode?: string;
  brand?: string;
  description?: string;
  expirationDate?: Date;
  id: string;
  notes?: string;
  openingDate?: Date;
  owner?: string;
  ownerId?: string;
  purchaseDate?: Date;
  quantity?: number;
  status?: string;
  unit?: string;
}

function updateStockItemUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateStockItemUseCaseParams, void> {
  return {
    execute: async (params: UpdateStockItemUseCaseParams) => {
      try {
        if (!params.id) {
          throw new FieldRequired({ id: params.id });
        }

        await repositories.stockRepository.updateStockItem({
          barcode: params.barcode,
          brand: params.brand,
          description: params.description,
          expirationDate: params.expirationDate,
          id: params.id,
          notes: params.notes,
          openingDate: params.openingDate,
          owner: params.owner,
          ownerId: params.ownerId,
          purchaseDate: params.purchaseDate,
          quantity: params.quantity,
          status: params.status,
          unit: params.unit,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "updateStockItemUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.update_stock_item_use_case",
  };
}

export default updateStockItemUseCase;
