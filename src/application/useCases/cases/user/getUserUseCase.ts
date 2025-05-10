import UserDTO from "@application/dto/user/UserDTO";
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
        const user = await repositories.userRepository.getUser();

        return UserDTO.fromEntity(user);
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
