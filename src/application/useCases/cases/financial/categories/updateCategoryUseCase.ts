import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface UpdateCategoryUseCaseParams {
  depthLevel?: number;
  icon?: string;
  iconColor?: string;
  id: string;
  name?: string;
  owner?: string;
  ownerId?: string;
  parentId?: null | string;
  type?: string;
}

function updateCategoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateCategoryUseCaseParams, void> {
  return {
    execute: async (params: UpdateCategoryUseCaseParams) => {
      const owner = params.owner
        ? OwnerType[params.owner as keyof typeof OwnerType]
        : undefined;

      if (params.owner && !owner) {
        throw new FieldInvalid({ owner });
      }

      const type = params.type
        ? CategoryType[params.type as keyof typeof CategoryType]
        : undefined;

      try {
        await repositories.financialRepository.category.updateCategory({
          depthLevel: params.depthLevel,
          icon: params.icon,
          iconColor: params.iconColor,
          id: params.id,
          name: params.name,
          owner,
          ownerId: params.ownerId,
          parentId: params.parentId,
          type,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.updateCategoryUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.update_category_use_case",
  };
}

export default updateCategoryUseCase;
