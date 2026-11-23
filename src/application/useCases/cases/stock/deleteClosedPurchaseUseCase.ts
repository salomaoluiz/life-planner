import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type DeleteClosedPurchaseUseCaseParams = { id: string };

// Spec 120: Deletes a closed purchase; the rows already used stay in stock (FR 41).
function deleteClosedPurchaseUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  DeleteClosedPurchaseUseCaseParams,
  Array<{ description: string; rowId: string }>
> {
  return {
    execute: async (params: DeleteClosedPurchaseUseCaseParams) => {
      try {
        return await repositories.stockRepository.deleteClosedPurchase(
          params.id,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "deleteClosedPurchaseUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.delete_closed_purchase_use_case",
  };
}

export default deleteClosedPurchaseUseCase;
