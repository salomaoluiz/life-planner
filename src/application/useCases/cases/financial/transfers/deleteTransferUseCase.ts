import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { DeleteTransferRepositoryParams } from "@domain/repositories/financial";

export type DeleteTransferUseCaseParams = DeleteTransferRepositoryParams;

// Spec 098: removes a transfer with its out, in and fee rows.
function deleteTransferUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteTransferUseCaseParams, void> {
  return {
    execute: async (params: DeleteTransferUseCaseParams) => {
      try {
        return await repositories.financialRepository.transfer.deleteTransfer(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteTransferUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_transfer_use_case",
  };
}

export default deleteTransferUseCase;
