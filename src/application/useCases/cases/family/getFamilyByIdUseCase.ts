import FamilyDTO from "@application/dto/family/FamilyDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetFamilyByIdUseCaseParams {
  familyId: string;
}

function getFamilyByIdUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetFamilyByIdUseCaseParams, FamilyDTO> {
  return {
    execute: async (params) => {
      try {
        const entity = await repositories.familyRepository.getFamilyById(
          params.familyId,
        );

        return FamilyDTO.fromEntity(entity);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getFamilyByIdUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family.get_family_by_id_use_case",
  };
}

export default getFamilyByIdUseCase;
