import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type DeleteShoppingListRowUseCaseParams = { rowId: string };

// Spec 118 FR 11/18: removing a row (the API records the dismissal).
function deleteShoppingListRowUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteShoppingListRowUseCaseParams, void> {
  return {
    execute: async (params: DeleteShoppingListRowUseCaseParams) => {
      try {
        return await repositories.stockRepository.deleteShoppingListRow(
          params.rowId,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "deleteShoppingListRowUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.delete_shopping_list_row_use_case",
  };
}

export default deleteShoppingListRowUseCase;
