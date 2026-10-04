import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateCategoryUseCaseParams {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  type: string;
}

function createCategoryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateCategoryUseCaseParams, void> {
  return {
    execute: async (params: CreateCategoryUseCaseParams) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];

      if (!owner) {
        throw new FieldInvalid({ owner });
      }

      const type =
        CategoryType[params.type as keyof typeof CategoryType] ??
        CategoryType.EXPENSE;

      try {
        await repositories.financialRepository.category.createCategory({
          depthLevel: params.depthLevel,
          icon: params.icon,
          iconColor: params.iconColor,
          name: params.name,
          owner,
          ownerId: params.ownerId,
          parentId: params.parentId,
          type,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.createCategoryUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.create_category_use_case",
  };
}

export default createCategoryUseCase;
