import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ShoppingListEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";
import { UpdateShoppingListRepositoryParams } from "@domain/repositories/stock";

export type UpdateShoppingListUseCaseParams =
  UpdateShoppingListRepositoryParams;

// Spec 118 FR 3/4: rename, default, archive and reactivate.
function updateShoppingListUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateShoppingListUseCaseParams,
  ShoppingListEntity
> {
  return {
    execute: async (params: UpdateShoppingListUseCaseParams) => {
      try {
        return await repositories.stockRepository.updateShoppingList(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "updateShoppingListUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.update_shopping_list_use_case",
  };
}

export default updateShoppingListUseCase;
