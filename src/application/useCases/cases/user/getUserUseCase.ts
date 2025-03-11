import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { captureException } from "@infrastructure/monitoring";
import Repositories from "@domain/repositories";
import { BusinessError } from "@domain/entities/errors";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

type GetUserUseCaseResponse = UserProfileEntity | BusinessError;

function getUserUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<GetUserUseCaseResponse> {
  return {
    execute: async () => {
      try {
        return await repositories.userRepository.getUser();
      } catch (error) {
        if (error instanceof BusinessError) {
          return error;
        }

        captureException({
          name: "getUserUseCase",
          cause: error,
          message: "Error getting user",
        });

        throw error;
      }
    },
  };
}

export default getUserUseCase;
