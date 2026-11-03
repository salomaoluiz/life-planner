import OwnerDTO from "@application/dto/user/OwnerDTO";
import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getOwnersUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<OwnerDTO[]> {
  return {
    execute: async () => {
      try {
        const owners = await repositories.userRepository.getOwners();

        return owners.map(
          (owner) =>
            new OwnerDTO({
              archived: owner.archived,
              id: owner.ownerId,
              name: owner.name,
              type: owner.type,
            }),
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "user.getOwnersUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "user.get_owners_use_case",
  };
}

export default getOwnersUseCase;
