import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function loginWithGoogleUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        await repositories.loginRepository.loginWithGoogle();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "loginWithGoogleUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "auth.login_with_google_use_case",
  };
}

export default loginWithGoogleUseCase;
