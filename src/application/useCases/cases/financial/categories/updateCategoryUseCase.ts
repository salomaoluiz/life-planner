import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface UpdateCategoryUseCaseParams {
  depthLevel?: number;
  icon?: string;
  id: string;
  name?: string;
  owner?: string;
  ownerId?: string;
  parentId?: string;
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

      try {
        await repositories.financialRepository.category.updateCategory({
          depthLevel: params.depthLevel,
          icon: params.icon,
          id: params.id,
          name: params.name,
          owner,
          ownerId: params.ownerId,
          parentId: params.parentId,
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
