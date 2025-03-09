import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import Repositories from "@domain/repositories";
import { DefaultError } from "@domain/entities/errors";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

function getUserUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<UserProfileEntity> {
  return {
    uniqueName: "user.get_user_use_case",
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
  };
}

export default getUserUseCase;
