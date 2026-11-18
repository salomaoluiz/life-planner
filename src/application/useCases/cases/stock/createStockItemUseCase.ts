import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface CreateStockItemUseCaseParams extends RequiredFields {
  barcode?: string;
  brand?: string;
  categoryId?: string;
  expirationDate?: Date;
  idealQuantity?: number;
  locationId?: string;
  minQuantity?: number;
  notes?: string;
  openedShelfLifeDays?: number;
  purchaseDate?: Date;
  quickStep?: number;
  stockOnly?: boolean;
  warnDaysClosed?: number;
  warnDaysOpened?: number;
}

interface RequiredFields {
  description: string;
  owner: string;
  ownerId: string;
  // 0 creates the item with no lot.
  quantity: number;
  unit: string;
}

const DEFAULT_WARN_DAYS_CLOSED = 7;
const DEFAULT_WARN_DAYS_OPENED = 1;

function createStockItemUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateStockItemUseCaseParams, void> {
  return {
    execute: async (params: CreateStockItemUseCaseParams) => {
      try {
        validateRequiredFields(params);
        await repositories.stockRepository.createStockItem({
          barcode: params.barcode,
          brand: params.brand,
          categoryId: params.categoryId,
          description: params.description,
          expirationDate: params.expirationDate,
          idealQuantity: params.idealQuantity,
          locationId: params.locationId,
          minQuantity: params.minQuantity,
          notes: params.notes,
          openedShelfLifeDays: params.openedShelfLifeDays,
          owner: params.owner,
          ownerId: params.ownerId,
          purchaseDate: params.purchaseDate,
          quantity: params.quantity,
          quickStep: params.quickStep,
          stockOnly: params.stockOnly ?? false,
          unit: params.unit,
          warnDaysClosed: params.warnDaysClosed ?? DEFAULT_WARN_DAYS_CLOSED,
          warnDaysOpened: params.warnDaysOpened ?? DEFAULT_WARN_DAYS_OPENED,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createStockItemUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_stock_item_use_case",
  };
}

function validateRequiredFields(params: CreateStockItemUseCaseParams) {
  const missing: Record<string, undefined> = {};

  if (!params.description) {
    missing.description = undefined;
  }

  if (!params.owner) {
    missing.owner = undefined;
  }

  if (!params.ownerId) {
    missing.ownerId = undefined;
  }

  if (!params.unit) {
    missing.unit = undefined;
  }

  if (typeof params.quantity !== "number" || Number.isNaN(params.quantity)) {
    missing.quantity = undefined;
  }

  if (Object.keys(missing).length) {
    throw new FieldRequired(missing);
  }
}

export default createStockItemUseCase;
