import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function loginWithGoogleUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        const response = await repositories.loginRepository.loginWithGoogle();
        if (response) {
          const user = await repositories.userRepository.getUserById(
            response.id,
          );
          if (!user) {
            await repositories.userRepository.createUser({
              avatarURL: response.avatarURL,
              email: response.email,
              id: response.id,
              name: response.name,
            });
          }
        }
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
