import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import Repositories from "@domain/repositories";

export interface DeleteTransactionUseCaseParams {
  id: string;
  ownerId: string;
  // Required on a recurring occurrence (spec 034 FR 29).
  scope?: InstallmentScope;
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
          scope: params.scope,
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
