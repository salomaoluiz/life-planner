import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import Repositories from "@domain/repositories";

function getFamiliesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<FamilyEntity[]> {
  return {
    execute: async () => {
      try {
        const user = await repositories.userRepository.getUser();
        return await repositories.familyRepository.getFamilies(user.id);
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
