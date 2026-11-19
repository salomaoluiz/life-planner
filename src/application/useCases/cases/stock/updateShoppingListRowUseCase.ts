import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ShoppingListRowEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";
import { UpdateShoppingListRowRepositoryParams } from "@domain/repositories/stock";

export type UpdateShoppingListRowUseCaseParams =
  UpdateShoppingListRowRepositoryParams;

// Spec 118 FR 12 and 22: quantity and estimated price of a row.
function updateShoppingListRowUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateShoppingListRowUseCaseParams,
  ShoppingListRowEntity
> {
  return {
    execute: async (params: UpdateShoppingListRowUseCaseParams) => {
      try {
        return await repositories.stockRepository.updateShoppingListRow(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "updateShoppingListRowUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.update_shopping_list_row_use_case",
  };
}

export default updateShoppingListRowUseCase;
