import { Datasources } from "@data/datasource";
import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { CategoryIconEntity } from "@domain/entities/financial/CategoryIconEntity";
import { FinancialCategoryRepository } from "@domain/repositories/financial";

import createCategory from "./createCategory";
import deleteCategory from "./deleteCategory";
import getCategories from "./getCategories";
import getCategoryIcons from "./getCategoryIcons";
import updateCategory from "./updateCategory";
import updateCategoryAppearance from "./updateCategoryAppearance";

function categoryRepositoryImpl(
  datasources: Datasources,
): FinancialCategoryRepository {
  return {
    async createCategory(params): Promise<CategoryEntity> {
      return createCategory(params, datasources);
    },
    async deleteCategory(params): Promise<void> {
      return deleteCategory(params, datasources);
    },
    async getCategories(ownerIds): Promise<CategoryEntity[]> {
      return getCategories(ownerIds, datasources);
    },
    async getCategoryIcons(params): Promise<CategoryIconEntity[]> {
      return getCategoryIcons(params, datasources);
    },
    async updateCategory(params): Promise<void> {
      return updateCategory(params, datasources);
    },
    async updateCategoryAppearance(params): Promise<void> {
      return updateCategoryAppearance(params, datasources);
    },
  };
}

export default categoryRepositoryImpl;
