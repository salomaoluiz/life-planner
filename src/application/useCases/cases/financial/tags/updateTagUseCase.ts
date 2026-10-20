import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import { MAX_TAG_LENGTH } from "./createTagUseCase";

export interface UpdateTagUseCaseParams {
  id: string;
  name?: string;
  scope?: "ALL";
}

function updateTagUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateTagUseCaseParams, void> {
  return {
    execute: async (params: UpdateTagUseCaseParams) => {
      const name = params.name?.trim();

      if (
        name !== undefined &&
        (name.length === 0 || name.length > MAX_TAG_LENGTH)
      ) {
        throw new FieldInvalid({ name: params.name });
      }

      try {
        await repositories.financialRepository.tag.updateTag({
          id: params.id,
          name,
          scope: params.scope,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateTagUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.update_tag_use_case",
  };
}

export default updateTagUseCase;
