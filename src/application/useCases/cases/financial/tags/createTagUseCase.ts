import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export const MAX_TAG_LENGTH = 30;

export interface CreateTagUseCaseParams {
  name: string;
  // "ALL" creates one tag for the Personal scope and every family (no ownerId).
  owner: string;
  ownerId?: string;
}

function createTagUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateTagUseCaseParams, void> {
  return {
    execute: async (params: CreateTagUseCaseParams) => {
      const owner =
        params.owner === "ALL"
          ? "ALL"
          : OwnerType[params.owner as keyof typeof OwnerType];
      const name = params.name.trim();

      if (!owner) {
        throw new FieldInvalid({ owner: params.owner });
      }

      if (name.length === 0 || name.length > MAX_TAG_LENGTH) {
        throw new FieldInvalid({ name: params.name });
      }

      try {
        await repositories.financialRepository.tag.createTag({
          name,
          owner,
          ownerId: params.ownerId,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createTagUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.create_tag_use_case",
  };
}

export default createTagUseCase;
