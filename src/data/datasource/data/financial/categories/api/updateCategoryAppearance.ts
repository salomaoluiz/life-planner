import { toApiColor } from "@data/models/financial/iconColor";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import { categoryBody, categoryErrorHandlers } from "./updateCategory";

export type Params = Parameters<
  CategoryDatasource["updateCategoryAppearance"]
>[0];
export type Response = ReturnType<
  CategoryDatasource["updateCategoryAppearance"]
>;

// Spec 058: one request saves the category and the icon / color of its descendants, all or nothing.
async function updateCategoryAppearance(params: Params): Response {
  const body = {
    ...categoryBody(params),
    descendants: params.descendants.map((item) => ({
      icon: item.icon,
      iconColor:
        item.iconColor === undefined ? undefined : toApiColor(item.iconColor),
      id: item.id,
    })),
  };

  try {
    await api.patch(`/v1/finance/categories/${params.id}/appearance`, body);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "CategoryDatasource - updateCategoryAppearance",
        id: params.id,
      },
      categoryErrorHandlers(body),
    );
  }
}

export default updateCategoryAppearance;
