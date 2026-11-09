import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { TransferResultEntity } from "@domain/repositories/financial";

export type GetTransferUseCaseParams = string;

// Spec 098: one transfer with its rows.
function getTransferUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetTransferUseCaseParams,
  TransferResultEntity
> {
  return {
    execute: async (params: GetTransferUseCaseParams) => {
      try {
        return await repositories.financialRepository.transfer.getTransfer(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getTransferUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.get_transfer_use_case",
  };
}

export default getTransferUseCase;
