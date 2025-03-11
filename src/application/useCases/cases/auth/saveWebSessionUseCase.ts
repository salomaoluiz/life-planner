import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import Repositories from "@domain/repositories";
import { DefaultError, UserNotLoggedError } from "@domain/entities/errors";

type Hash = string | undefined;

function saveWebSessionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<Hash, void> {
  return {
    uniqueName: "auth.save_web_session_use_case",
    async execute(hash: Hash): Promise<void> {
      try {
        if (hash === undefined) {
          throw new UserNotLoggedError();
        }

        const params = new URLSearchParams(hash.replace("#", "?"));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken === null || refreshToken === null) {
          throw new UserNotLoggedError();
        }

        await repositories.loginRepository.saveSession({
          accessToken,
          refreshToken,
        });
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
  };
}

export default saveWebSessionUseCase;
