import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ShoppingListRowResultEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";
import { AddShoppingListRowRepositoryParams } from "@domain/repositories/stock";

export type AddShoppingListRowUseCaseParams =
  AddShoppingListRowRepositoryParams;

// Spec 118 FR 13-15 and 18: an item row, a text row or the restore of a removed row.
function addShoppingListRowUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  AddShoppingListRowUseCaseParams,
  ShoppingListRowResultEntity
> {
  return {
    execute: async (params: AddShoppingListRowUseCaseParams) => {
      try {
        return await repositories.stockRepository.addShoppingListRow(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "addShoppingListRowUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.add_shopping_list_row_use_case",
  };
}

export default addShoppingListRowUseCase;
