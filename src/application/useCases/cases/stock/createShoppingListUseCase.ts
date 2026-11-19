import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ShoppingListEntity } from "@domain/entities/stock/ShoppingListEntity";
import Repositories from "@domain/repositories";
import { CreateShoppingListRepositoryParams } from "@domain/repositories/stock";

export type CreateShoppingListUseCaseParams =
  CreateShoppingListRepositoryParams;

// Spec 118 FR 1: a new list of the owner (the default one is created by the API).
function createShoppingListUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateShoppingListUseCaseParams,
  ShoppingListEntity
> {
  return {
    execute: async (params: CreateShoppingListUseCaseParams) => {
      try {
        return await repositories.stockRepository.createShoppingList(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "createShoppingListUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.create_shopping_list_use_case",
  };
}

export default createShoppingListUseCase;
