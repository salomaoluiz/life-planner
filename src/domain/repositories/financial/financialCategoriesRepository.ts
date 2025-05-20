import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialCategoriesRepository = {
  createCategory(
    params: CreateCategoryRepositoryParams,
  ): Promise<CategoryEntity>;
  deleteCategory(params: DeleteCategoryRepositoryParams): Promise<void>;
  getCategories(ownerIds: string[]): Promise<CategoryEntity[]>;
  updateCategory(params: UpdateCategoryRepositoryParams): Promise<void>;
};

interface CreateCategoryRepositoryParams {
  depthLevel?: number;
  icon: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
}

interface DeleteCategoryRepositoryParams {
  id: string;
  ownerId: string;
}

interface UpdateCategoryRepositoryParams {
  depthLevel?: number;
  icon?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId: string;
  parentId?: string;
}

export { CreateCategoryRepositoryParams, UpdateCategoryRepositoryParams };
