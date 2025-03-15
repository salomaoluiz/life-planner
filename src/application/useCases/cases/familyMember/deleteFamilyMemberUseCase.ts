import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteFamilyMemberUseCaseParams {
  id: string;
}

function deleteFamilyMemberUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteFamilyMemberUseCaseParams, void> {
  return {
    execute: async (params: DeleteFamilyMemberUseCaseParams) => {
      try {
        await repositories.familyMemberRepository.deleteFamilyMember(params.id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "deleteFamilyMemberUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family_member.delete_family_member_use_case",
  };
}

export default deleteFamilyMemberUseCase;
