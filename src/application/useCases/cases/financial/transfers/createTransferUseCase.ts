import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import {
  CreateTransferRepositoryParams,
  TransferResultEntity,
} from "@domain/repositories/financial";

export type CreateTransferUseCaseParams = CreateTransferRepositoryParams;

// Spec 098: a new transfer (and its series when `recurrence` is set).
function createTransferUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateTransferUseCaseParams,
  TransferResultEntity
> {
  return {
    execute: async (params: CreateTransferUseCaseParams) => {
      try {
        return await repositories.financialRepository.transfer.createTransfer(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createTransferUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.create_transfer_use_case",
  };
}

export default createTransferUseCase;
