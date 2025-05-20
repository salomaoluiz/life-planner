import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetCategoriesUseCaseParams {
  ownerIds: string[];
}

function getCategoriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetCategoriesUseCaseParams, CategoryDTO[]> {
  return {
    execute: async (params) => {
      try {
        const categories =
          await repositories.financialRepository.categories.getCategories(
            params.ownerIds,
          );

        return categories.map((category) => CategoryDTO.fromEntity(category));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.getCategoriesUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_categories_use_case",
  };
}

export default getCategoriesUseCase;
