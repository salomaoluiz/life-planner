import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { captureException } from "@infrastructure/monitoring";
import Repositories from "@domain/repositories";
import { BusinessError } from "@domain/entities/errors";

type LoginWithGoogleUseCaseResponse = void | BusinessError;

function loginWithGoogleUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<LoginWithGoogleUseCaseResponse> {
  return {
    execute: async () => {
      try {
        await repositories.loginRepository.loginWithGoogle();
      } catch (error) {
        if (error instanceof BusinessError) {
          return error;
        }

        captureException({
          name: "loginWithGoogleUseCase",
          cause: error,
          message: "Error logging in with Google",
        });

        throw error;
      }
    },
  };
}

export default loginWithGoogleUseCase;
