import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { encode } from "@infrastructure/crypto";

export interface CreateFamilyUseCaseParams {
  name: string;
}

function createFamilyUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateFamilyUseCaseParams, void> {
  return {
    execute: async (params: CreateFamilyUseCaseParams) => {
      try {
        const user = await repositories.userRepository.getUser();
        const family = await repositories.familyRepository.createFamily({
          name: params.name,
          ownerId: user.id,
        });

        const joinDate = new Date().toISOString();
        const inviteToken = await encode({
          email: user.email,
          familyId: family.id,
          joinDate,
        });
        await repositories.familyMemberRepository.createFamilyMember({
          email: user.email,
          familyId: family.id,
          inviteToken,
          joinDate,
          userId: user.id,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "createFamilyUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "family.create_family_use_case",
  };
}

export default createFamilyUseCase;
