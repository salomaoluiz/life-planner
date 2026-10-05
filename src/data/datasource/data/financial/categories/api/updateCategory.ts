import { toApiColor } from "@data/models/financial/iconColor";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CategoryDatasource["updateCategory"]>[0];
export type Response = ReturnType<CategoryDatasource["updateCategory"]>;

async function updateCategory(params: Params): Response {
  // The API rejects owner / ownerId on PATCH and depthLevel is computed server-side.
  const body = {
    icon: params.icon,
    iconColor:
      params.iconColor === undefined ? undefined : toApiColor(params.iconColor),
    name: params.name,
    parentId: params.parentId,
    type: params.type,
  };

  if (Object.values(body).every((value) => value === undefined)) {
    return;
  }

  try {
    await api.patch(`/v1/finance/categories/${params.id}`, body);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "CategoryDatasource - updateCategory", id: params.id },
      { fields: body },
    );
  }
}

export default updateCategory;
