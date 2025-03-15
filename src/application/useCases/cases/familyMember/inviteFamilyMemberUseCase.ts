import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { encode } from "@infrastructure/crypto";

export interface InviteFamilyMemberUseCaseParams {
  email: string;
  familyId: string;
}

interface Response {
  inviteToken: string;
}

function inviteFamilyMemberUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<InviteFamilyMemberUseCaseParams, Response> {
  return {
    execute: async (params: InviteFamilyMemberUseCaseParams) => {
      try {
        const inviteToken = await encode({
          email: params.email,
          familyId: params.familyId,
          inviteDate: Date.now(),
        });

        await repositories.familyMemberRepository.createFamilyMember({
          email: params.email,
          familyId: params.familyId,
          inviteToken,
        });

        return { inviteToken };
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
