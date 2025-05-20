import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateCategoryUseCaseParams {
  depthLevel?: number;
  icon: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
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

      try {
        await repositories.financialRepository.categories.createCategory({
          depthLevel: params.depthLevel,
          icon: params.icon,
          name: params.name,
          owner,
          ownerId: params.ownerId,
          parentId: params.parentId,
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
