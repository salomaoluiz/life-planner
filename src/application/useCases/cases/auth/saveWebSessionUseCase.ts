import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import Repositories from "@domain/repositories";
import { captureException } from "@infrastructure/monitoring";
import { BusinessError, UserNotLoggedError } from "@domain/entities/errors";

type Hash = string | undefined;

type Response = boolean | BusinessError;

function saveWebSessionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<Hash, Response> {
  return {
    async execute(hash: Hash): Promise<Response> {
      try {
        if (hash === undefined) {
          return new UserNotLoggedError();
        }

        const params = new URLSearchParams(hash.replace("#", "?"));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken === null || refreshToken === null) {
          return new UserNotLoggedError();
        }

        await repositories.loginRepository.saveSession({
          accessToken,
          refreshToken,
        });
        return true;
      } catch (error) {
        if (error instanceof BusinessError) {
          return error;
        }

        captureException({
          name: "saveWebSessionUseCase",
          cause: error,
          message: "Error saving web session",
        });

        throw error;
      }
    },
  };
}

export default saveWebSessionUseCase;
