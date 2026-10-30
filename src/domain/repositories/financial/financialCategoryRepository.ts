import CategoryEntity, {
  CategoryOwner,
  CategoryStatus,
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import { CategoryIconEntity } from "@domain/entities/financial/CategoryIconEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialCategoryRepository = {
  createCategory(
    params: CreateCategoryRepositoryParams,
  ): Promise<CategoryEntity>;
  deleteCategory(params: DeleteCategoryRepositoryParams): Promise<void>;
  getCategories(ownerIds: string[]): Promise<CategoryEntity[]>;
  getCategoryIcons(
    params: GetCategoryIconsRepositoryParams,
  ): Promise<CategoryIconEntity[]>;
  updateCategory(params: UpdateCategoryRepositoryParams): Promise<void>;
  // Spec 058: the category and the icon / color of its descendants, all or nothing.
  updateCategoryAppearance(
    params: UpdateCategoryAppearanceRepositoryParams,
  ): Promise<void>;
};

interface CreateCategoryRepositoryParams {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  name: string;
  owner: CategoryOwner;
  ownerId?: string;
  parentId?: string;
  type: CategoryType;
}

interface DeleteCategoryRepositoryParams {
  id: string;
  ownerId: string;
}

interface GetCategoryIconsRepositoryParams {
  limit?: number;
  q?: string;
}

interface UpdateCategoryAppearanceRepositoryParams extends UpdateCategoryRepositoryParams {
  descendants: { icon?: string; iconColor?: string; id: string }[];
}

interface UpdateCategoryRepositoryParams {
  depthLevel?: number;
  icon?: string;
  iconColor?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  parentId?: null | string;
  scope?: "ALL";
  // Archives / reactivates the category with its whole subtree (spec 041).
  status?: CategoryStatus;
  type?: CategoryType;
}

export {
  CreateCategoryRepositoryParams,
  GetCategoryIconsRepositoryParams,
  UpdateCategoryAppearanceRepositoryParams,
  UpdateCategoryRepositoryParams,
};
