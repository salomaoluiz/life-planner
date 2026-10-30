import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import Repositories from "@domain/repositories";

import { UpdateCategoryUseCaseParams } from "./updateCategoryUseCase";

export interface UpdateCategoryAppearanceUseCaseParams extends UpdateCategoryUseCaseParams {
  descendants: { icon?: string; iconColor?: string; id: string }[];
}

// Spec 058: saves the category and the icon / color of its descendants in one request (all or nothing).
function updateCategoryAppearanceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateCategoryAppearanceUseCaseParams,
  void
> {
  return {
    execute: async (params: UpdateCategoryAppearanceUseCaseParams) => {
      if (params.descendants.length === 0) {
        throw new FieldInvalid({ descendants: params.descendants });
      }

      try {
        await repositories.financialRepository.category.updateCategoryAppearance(
          {
            descendants: params.descendants,
            icon: params.icon,
            iconColor: params.iconColor,
            id: params.id,
            name: params.name,
            parentId: params.parentId,
            scope: params.scope,
            status: params.status,
            type: params.type
              ? CategoryType[params.type as keyof typeof CategoryType]
              : undefined,
          },
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.updateCategoryAppearanceUseCase",
          });
        }
        throw error;
      }
    },
    uniqueName: "financial.update_category_appearance_use_case",
  };
}

export default updateCategoryAppearanceUseCase;
