import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ShoppingListCardEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";
import { GetShoppingListsRepositoryParams } from "@domain/repositories/stock";

export type GetShoppingListsUseCaseParams = GetShoppingListsRepositoryParams;

// Spec 118: the cards of the lists screen (no owner = every readable owner).
function getShoppingListsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetShoppingListsUseCaseParams,
  ShoppingListCardEntity[]
> {
  return {
    execute: async (params: GetShoppingListsUseCaseParams) => {
      try {
        return await repositories.stockRepository.getShoppingLists(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getShoppingListsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_shopping_lists_use_case",
  };
}

export default getShoppingListsUseCase;
