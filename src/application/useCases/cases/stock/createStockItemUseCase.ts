import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface CreateStockItemUseCaseParams extends RequiredFields {
  barcode?: string;
  brand?: string;
  expirationDate?: Date;
  notes?: string;
  openingDate?: Date;
  purchaseDate?: Date;
}

interface RequiredFields {
  description: string;
  owner: string;
  ownerId: string;
  quantity: number;
  unit: string;
}

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
          description: params.description,
          expirationDate: params.expirationDate,
          notes: params.notes,
          openingDate: params.openingDate,
          owner: params.owner,
          ownerId: params.ownerId,
          purchaseDate: params.purchaseDate,
          quantity: params.quantity,
          unit: params.unit,
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
  const requiredFields: Array<keyof RequiredFields> = [
    "description",
    "owner",
    "ownerId",
    "quantity",
    "unit",
  ];

  const missingFields = Object.entries(params).filter(([key, value]) => {
    return (
      requiredFields.includes(key as (typeof requiredFields)[number]) && !value
    );
  });

  if (missingFields.length) {
    const fieldsObject = missingFields.reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, undefined>,
    );

    throw new FieldRequired(fieldsObject);
  }
}

export default createStockItemUseCase;
