import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

interface DeleteAccountParams {
  email: string;
}

// The account is gone on the server: the local session must go too (same cleanup as logout).
function deleteAccountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteAccountParams, void> {
  return {
    execute: async (params) => {
      try {
        await repositories.userRepository.deleteAccount(params.email);
        await repositories.loginRepository.logout();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "deleteAccountUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "user.delete_account_use_case",
  };
}

export default deleteAccountUseCase;
