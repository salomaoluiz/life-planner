import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";

import createCategory from "./createCategory";
import deleteCategory from "./deleteCategory";
import getCategories from "./getCategories";
import updateCategory from "./updateCategory";

function transactionDatasourceImpl(): CategoryDatasource {
  return {
    createCategory: createCategory,
    deleteCategory: deleteCategory,
    getCategories: getCategories,
    updateCategory: updateCategory,
  };
}

export default transactionDatasourceImpl;
