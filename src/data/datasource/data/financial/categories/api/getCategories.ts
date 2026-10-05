import CategoryModel from "@data/models/financial/CategoryModel";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<CategoryDatasource["getCategories"]>[0];
export type Response = ReturnType<CategoryDatasource["getCategories"]>;

async function getCategories(ownerIds: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/categories${toOwnerQuery(ownerIds)}`,
    );

    return data.map((category) => CategoryModel.fromJSON(category));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "CategoryDatasource - getCategories",
      ownerIds,
    });
  }
}

export default getCategories;
