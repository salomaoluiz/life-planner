import UserDTO from "@application/dto/user/UserDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

type Response = undefined | UserDTO;

function getUserByUserIdUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, Response> {
  return {
    execute: async (userId: string) => {
      try {
        const user = await repositories.userRepository.getUserById(userId);

        if (!user) {
          return undefined;
        }

        return UserDTO.fromEntity(user);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getUserByUserIdUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "user.get_user_by_user_id_use_case",
  };
}

export default getUserByUserIdUseCase;
