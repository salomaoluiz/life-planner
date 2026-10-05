import CategoryModel from "@data/models/financial/CategoryModel";
import { toApiColor } from "@data/models/financial/iconColor";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CategoryDatasource["createCategory"]>[0];
export type Response = ReturnType<CategoryDatasource["createCategory"]>;

async function createCategory(params: Params): Response {
  // depthLevel is computed by the API (read-only): never sent.
  const body = {
    icon: params.icon,
    iconColor: toApiColor(params.iconColor ?? "black"),
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    parentId: params.parentId,
    type: params.type,
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      "/v1/finance/categories",
      body,
    );

    return CategoryModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "CategoryDatasource - createCategory",
        ownerId: params.ownerId,
      },
      { fields: body },
    );
  }
}

export default createCategory;
