import CategoryIconModel from "@data/models/financial/CategoryIconModel";
import CategoryModel from "@data/models/financial/CategoryModel";
import { OwnerType } from "@data/models/financial/TransactionModel";

export interface CategoryDatasource {
  createCategory(
    params: CreateCategoryDatasourceParams,
  ): Promise<CategoryModel>;
  deleteCategory(params: DeleteCategoryDatasourceParams): Promise<void>;
  getCategories(ownerIds: string[]): Promise<CategoryModel[]>;
  getCategoryIcons(params: {
    limit?: number;
    q?: string;
  }): Promise<CategoryIconModel[]>;
  updateCategory(params: UpdateCategoryDatasourceParams): Promise<void>;
  updateCategoryAppearance(
    params: UpdateCategoryAppearanceDatasourceParams,
  ): Promise<void>;
}

// "ALL" (spec 038): the creator's Personal scope and every family they are in; no ownerId.
type CategoryOwner = "ALL" | OwnerType;

interface CreateCategoryDatasourceParams {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  name: string;
  owner: CategoryOwner;
  ownerId?: string;
  parentId?: string;
  type: string;
}

interface DeleteCategoryDatasourceParams {
  id: string;
  ownerId: string;
}

interface UpdateCategoryAppearanceDatasourceParams extends UpdateCategoryDatasourceParams {
  descendants: { icon?: string; iconColor?: string; id: string }[];
}

interface UpdateCategoryDatasourceParams {
  depthLevel?: number;
  icon?: string;
  iconColor?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  parentId?: null | string;
  // Turns a single-scope main category into an All category (no way back).
  scope?: "ALL";
  status?: "ACTIVE" | "ARCHIVED";
  type?: string;
}

export {
  CreateCategoryDatasourceParams,
  UpdateCategoryAppearanceDatasourceParams,
  UpdateCategoryDatasourceParams,
};
