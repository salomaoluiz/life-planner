import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ShoppingListDetailEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";

export type GetShoppingListUseCaseParams = { id: string };

// Spec 118 FR 19-21: one list grouped by category with the estimate.
function getShoppingListUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetShoppingListUseCaseParams,
  ShoppingListDetailEntity
> {
  return {
    execute: async (params: GetShoppingListUseCaseParams) => {
      try {
        return await repositories.stockRepository.getShoppingList(params.id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getShoppingListUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_shopping_list_use_case",
  };
}

export default getShoppingListUseCase;
