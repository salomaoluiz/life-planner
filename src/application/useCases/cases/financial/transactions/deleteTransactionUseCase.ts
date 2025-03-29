import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteTransactionUseCaseParams {
  id: string;
  ownerId: string;
}

function deleteTransactionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteTransactionUseCaseParams, void> {
  return {
    execute: async (params: DeleteTransactionUseCaseParams) => {
      try {
        await repositories.financialRepository.transaction.deleteTransaction({
          id: params.id,
          ownerId: params.ownerId,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.deleteTransactionUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_transaction_use_case",
  };
}

export default deleteTransactionUseCase;
