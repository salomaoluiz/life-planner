import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getFamilyMembersUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, FamilyMemberDTO[]> {
  return {
    execute: async (familyId: string) => {
      try {
        const entity =
          await repositories.familyMemberRepository.getFamilyMembers(familyId);
        return entity.map((familyMember) =>
          FamilyMemberDTO.fromEntity(familyMember),
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getFamilyMembersUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family_member.get_family_members_use_case",
  };
}

export default getFamilyMembersUseCase;
