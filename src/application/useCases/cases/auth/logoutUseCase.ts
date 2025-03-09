import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import Repositories from "@domain/repositories";
import { DefaultError } from "@domain/entities/errors";

function logoutUseCase(
  repository: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    uniqueName: "auth.logout_use_case",
    async execute() {
      try {
        await repository.loginRepository.logout();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "logoutUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
  };
}

export default logoutUseCase;
