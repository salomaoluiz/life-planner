import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import Repositories from "@domain/repositories";
import { captureException } from "@infrastructure/monitoring";
import { BusinessError } from "@domain/entities/errors";

function logoutUseCase(
  repository: Repositories,
): IUseCaseFactoryWithoutParamResponse<void | BusinessError> {
  return {
    async execute() {
      try {
        await repository.loginRepository.logout();
      } catch (error) {
        if (error instanceof BusinessError) {
          return error;
        }
        captureException({
          cause: error,
          message: "Error logging out",
          name: "logoutUseCase",
        });

        throw error;
      }
    },
  };
}

export default logoutUseCase;
