import FamilyDTO from "@application/dto/family/FamilyDTO";
import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import Repositories from "@domain/repositories";

function getFamiliesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<FamilyDTO[]> {
  return {
    execute: async () => {
      try {
        const user = await repositories.userRepository.getUser();
        const entities = await repositories.familyRepository.getFamilies(
          user.id,
        );

        return entities.map((entity: FamilyEntity) =>
          FamilyDTO.fromEntity(entity),
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getFamiliesUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family.get_families_use_case",
  };
}

export default getFamiliesUseCase;
