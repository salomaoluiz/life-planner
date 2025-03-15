import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface JoinFamilyMemberUseCaseParams {
  inviteToken: string;
}

function joinFamilyMemberUserCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<JoinFamilyMemberUseCaseParams, void> {
  return {
    execute: async (params: JoinFamilyMemberUseCaseParams) => {
      try {
        const joinDate = new Date().toISOString();

        const user = await repositories.userRepository.getUser();
        await repositories.familyMemberRepository.joinFamilyMember({
          inviteToken: params.inviteToken,
          joinDate,
          userId: user.id,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "joinFamilyMemberUserCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family_member.join_family_member_use_case",
  };
}

export default joinFamilyMemberUserCase;
