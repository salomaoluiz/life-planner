import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, UserNotLoggedError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

type Hash = string | undefined;

function saveWebSessionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<Hash, void> {
  return {
    async execute(hash: Hash): Promise<void> {
      try {
        if (!hash) {
          throw new UserNotLoggedError();
        }

        const params = new URLSearchParams(hash.replace("#", "?"));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken === null || refreshToken === null) {
          throw new UserNotLoggedError();
        }

        const response = await repositories.loginRepository.saveSession({
          accessToken,
          refreshToken,
        });
        const user = await repositories.userRepository.getUserById(response.id);
        if (!user) {
          await repositories.userRepository.createUser({
            avatarURL: response.avatarURL,
            email: response.email,
            id: response.id,
            name: response.name,
          });
        }
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "saveWebSessionUseCase",
            useCaseVariable: {
              hash,
            },
          });

          throw error;
        }

        throw error;
      }
    },
    uniqueName: "auth.save_web_session_use_case",
  };
}

export default saveWebSessionUseCase;
