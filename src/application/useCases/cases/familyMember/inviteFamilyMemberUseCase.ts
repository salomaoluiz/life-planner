import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface InviteFamilyMemberUseCaseParams {
  email: string;
  familyId: string;
}

export interface InviteFamilyMemberUseCaseResponse {
  inviteExpiresAt: Date;
  inviteToken: string;
}

function inviteFamilyMemberUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  InviteFamilyMemberUseCaseParams,
  InviteFamilyMemberUseCaseResponse
> {
  return {
    execute: async (params: InviteFamilyMemberUseCaseParams) => {
      try {
        // The API generates the token; nothing is encoded on the device any more.
        return await repositories.familyMemberRepository.inviteFamilyMember({
          email: params.email.trim(),
          familyId: params.familyId,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "inviteFamilyMemberUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family_member.invite_family_member_use_case",
  };
}

export default inviteFamilyMemberUseCase;
