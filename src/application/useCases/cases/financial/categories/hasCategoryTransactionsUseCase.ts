import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface HasCategoryTransactionsUseCaseParams {
  categoryId: string;
  ownerIds: string[];
}

// Spec 077: whether the category already has transactions (its type is then locked), without reading them.
function hasCategoryTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  HasCategoryTransactionsUseCaseParams,
  boolean
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.transaction.hasCategoryTransactions(
          params.ownerIds,
          params.categoryId,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.hasCategoryTransactionsUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "financial.has_category_transactions_use_case",
  };
}

export default hasCategoryTransactionsUseCase;
