import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import {
  TransferResultEntity,
  UpdateTransferRepositoryParams,
} from "@domain/repositories/financial";

export type UpdateTransferUseCaseParams = UpdateTransferRepositoryParams;

// Spec 098: edits a transfer (with the series scope when it is an occurrence).
function updateTransferUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateTransferUseCaseParams,
  TransferResultEntity
> {
  return {
    execute: async (params: UpdateTransferUseCaseParams) => {
      try {
        return await repositories.financialRepository.transfer.updateTransfer(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateTransferUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.update_transfer_use_case",
  };
}

export default updateTransferUseCase;
