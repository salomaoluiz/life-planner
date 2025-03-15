import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import Repositories from "@domain/repositories";

function getFamilyMembersUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, FamilyMemberEntity[]> {
  return {
    execute: async (familyId: string) => {
      try {
        return await repositories.familyMemberRepository.getFamilyMembers(
          familyId,
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
