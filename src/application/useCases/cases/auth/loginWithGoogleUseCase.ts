import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import Repositories from "@domain/repositories";
import { DefaultError } from "@domain/entities/errors";

function loginWithGoogleUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    uniqueName: "auth.login_with_google_use_case",
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
  };
}

export default loginWithGoogleUseCase;
