import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, InviteNotFound } from "@domain/entities/errors";
import { isValidInviteToken } from "@domain/entities/familyMember/inviteToken";
import Repositories from "@domain/repositories";

function getFamilyInviteUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, FamilyInviteDTO> {
  return {
    execute: async (inviteToken: string) => {
      try {
        if (!isValidInviteToken(inviteToken)) {
          throw new InviteNotFound();
        }

        const entity =
          await repositories.familyMemberRepository.getInvite(inviteToken);

        return FamilyInviteDTO.fromEntity(entity);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getFamilyInviteUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family_member.get_family_invite_use_case",
  };
}

export default getFamilyInviteUseCase;
