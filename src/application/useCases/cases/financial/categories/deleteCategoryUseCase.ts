import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteCategoryUseCaseParams {
  id: string;
  ownerId: string;
}

function deleteCategoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteCategoryUseCaseParams, void> {
  return {
    execute: async (params: DeleteCategoryUseCaseParams) => {
      try {
        await repositories.financialRepository.categories.deleteCategory({
          id: params.id,
          ownerId: params.ownerId,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.deleteCategoryUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_category_use_case",
  };
}

export default deleteCategoryUseCase;
