import CategoryModel, { OwnerType } from "@data/models/financial/CategoryModel";

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
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
}

interface DeleteCategoryDatasourceParams {
  id: string;
  ownerId: string;
}

interface UpdateCategoryDatasourceParams {
  depthLevel?: number;
  icon?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId: string;
  parentId?: string;
}

export { CreateCategoryDatasourceParams, UpdateCategoryDatasourceParams };
