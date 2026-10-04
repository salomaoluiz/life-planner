import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteAccountUseCaseParams {
  id: string;
  ownerId: string;
}

function deleteAccountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteAccountUseCaseParams, void> {
  return {
    execute: async (params: DeleteAccountUseCaseParams) => {
      try {
        await repositories.financialRepository.account.deleteAccount({
          id: params.id,
          ownerId: params.ownerId,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.deleteAccountUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.delete_account_use_case",
  };
}

export default deleteAccountUseCase;
