import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import Repositories from "@domain/repositories";

function getUserUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<UserProfileEntity> {
  return {
    execute: async () => {
      try {
        return await repositories.userRepository.getUser();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getUserUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "user.get_user_use_case",
  };
}

export default getUserUseCase;
