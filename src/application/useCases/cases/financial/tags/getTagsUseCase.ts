import TagDTO from "@application/dto/financial/TagDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetTagsUseCaseParams = string[];

function getTagsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetTagsUseCaseParams, TagDTO[]> {
  return {
    execute: async (ownerIds: GetTagsUseCaseParams) => {
      try {
        const tags =
          await repositories.financialRepository.tag.getTags(ownerIds);

        return tags.map((tag) => TagDTO.fromEntity(tag));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getTagsUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.get_tags_use_case",
  };
}

export default getTagsUseCase;
