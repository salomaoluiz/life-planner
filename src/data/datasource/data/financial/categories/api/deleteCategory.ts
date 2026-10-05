import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { CategoryHasTransactions } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CategoryDatasource["deleteCategory"]>[0];
export type Response = ReturnType<CategoryDatasource["deleteCategory"]>;

async function deleteCategory(params: Params): Response {
  try {
    // The API authorizes through the JWT: ownerId is only kept for the interface.
    await api.delete(`/v1/finance/categories/${params.id}`);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "CategoryDatasource - deleteCategory", id: params.id },
      { conflict: () => new CategoryHasTransactions() },
    );
  }
}

export default deleteCategory;
