import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface UpdateStockItemUseCaseParams {
  barcode?: null | string;
  brand?: null | string;
  categoryId?: null | string;
  description?: string;
  estimatedUnitPriceCents?: null | number;
  id: string;
  idealQuantity?: null | number;
  locationId?: null | string;
  minQuantity?: null | number;
  notes?: null | string;
  openedShelfLifeDays?: null | number;
  owner?: string;
  ownerId?: string;
  // The owner the item is in now (its cached list is refreshed).
  previousOwnerId: string;
  quickStep?: null | number;
  shoppingListId?: null | string;
  stockOnly?: boolean;
  unit?: string;
  warnDaysClosed?: number;
  warnDaysOpened?: number;
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

        await repositories.stockRepository.updateStockItem(params);
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
