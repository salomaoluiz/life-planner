import CategoryModel from "@data/models/financial/CategoryModel";
import { OwnerType } from "@data/models/financial/TransactionModel";

export interface CategoryDatasource {
  createCategory(
    params: CreateCategoryDatasourceParams,
  ): Promise<CategoryModel>;
  deleteCategory(params: DeleteCategoryDatasourceParams): Promise<void>;
  getCategories(ownerIds: string[]): Promise<CategoryModel[]>;
  updateCategory(params: UpdateCategoryDatasourceParams): Promise<void>;
}

interface CreateCategoryDatasourceParams {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
  type: string;
}

interface DeleteCategoryDatasourceParams {
  id: string;
  ownerId: string;
}

interface UpdateCategoryDatasourceParams {
  depthLevel?: number;
  icon?: string;
  iconColor?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  parentId?: string;
  type?: string;
}

export { CreateCategoryDatasourceParams, UpdateCategoryDatasourceParams };
