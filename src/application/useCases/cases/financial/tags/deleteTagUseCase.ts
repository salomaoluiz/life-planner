import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteTagUseCaseParams {
  id: string;
}

function deleteTagUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteTagUseCaseParams, void> {
  return {
    execute: async (params: DeleteTagUseCaseParams) => {
      try {
        await repositories.financialRepository.tag.deleteTag(params.id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteTagUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.delete_tag_use_case",
  };
}

export default deleteTagUseCase;
