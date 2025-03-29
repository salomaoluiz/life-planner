import OwnerDTO from "@application/dto/user/OwnerDTO";
import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

function getOwnersUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<OwnerDTO[]> {
  return {
    execute: async () => {
      try {
        const user = await repositories.userRepository.getUser();
        const families = await repositories.familyRepository.getFamilies(
          user.id,
        );

        const ownerIds = families.map((family) => ({
          id: family.id,
          name: family.name,
          type: OwnerType.FAMILY,
        }));

        ownerIds.push({ id: user.id, name: user.name, type: OwnerType.USER });

        return ownerIds.map((owner) => new OwnerDTO(owner));
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
