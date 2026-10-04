import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialCategoryRepository = {
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
  iconColor?: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
  type: CategoryType;
}

interface DeleteCategoryRepositoryParams {
  id: string;
  ownerId: string;
}

interface UpdateCategoryRepositoryParams {
  depthLevel?: number;
  icon?: string;
  iconColor?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  parentId?: string;
  type?: CategoryType;
}

export { CreateCategoryRepositoryParams, UpdateCategoryRepositoryParams };
