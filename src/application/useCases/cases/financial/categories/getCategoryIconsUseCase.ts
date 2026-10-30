import CategoryIconDTO from "@application/dto/financial/CategoryIconDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetCategoryIconsUseCaseParams {
  limit?: number;
  q?: string;
}

function getCategoryIconsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetCategoryIconsUseCaseParams,
  CategoryIconDTO[]
> {
  return {
    execute: async (params: GetCategoryIconsUseCaseParams) => {
      try {
        const icons =
          await repositories.financialRepository.category.getCategoryIcons(
            params,
          );

        return icons.map((icon) => CategoryIconDTO.fromEntity(icon));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getCategoryIconsUseCase" });
        }
        throw error;
      }
    },
    uniqueName: "financial.get_category_icons_use_case",
  };
}

export default getCategoryIconsUseCase;
