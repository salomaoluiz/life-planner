import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function logoutUseCase(
  repository: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
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
    uniqueName: "auth.logout_use_case",
  };
}

export default logoutUseCase;
