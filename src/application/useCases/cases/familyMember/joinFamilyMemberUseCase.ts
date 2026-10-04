import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, InviteNotFound } from "@domain/entities/errors";
import { isValidInviteToken } from "@domain/entities/familyMember/inviteToken";
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
        // A malformed token can never be valid: fail locally (no request, no path tricks).
        if (!isValidInviteToken(params.inviteToken)) {
          throw new InviteNotFound();
        }

        await repositories.familyMemberRepository.joinFamilyMember({
          inviteToken: params.inviteToken,
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
