import { toApiColor } from "@data/models/financial/iconColor";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import {
  CategoryArchived,
  CategoryHasPendingItems,
  CategoryParentArchived,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CategoryDatasource["updateCategory"]>[0];
export type Response = ReturnType<CategoryDatasource["updateCategory"]>;

// The 409 body lists what blocks the archive; tolerate a body without any of the keys.
function pendingItemsOf(body: Record<string, unknown>) {
  const blockers = (body.blockers ?? {}) as Record<string, unknown>;

  return new CategoryHasPendingItems({
    hiddenCount: typeof body.hiddenCount === "number" ? body.hiddenCount : 0,
    installmentPlans: Array.isArray(blockers.installmentPlans)
      ? blockers.installmentPlans
      : [],
    recurrences: Array.isArray(blockers.recurrences)
      ? blockers.recurrences
      : [],
  });
}

async function updateCategory(params: Params): Response {
  // The API rejects owner / ownerId on PATCH and depthLevel is computed server-side.
  const body = {
    icon: params.icon,
    iconColor:
      params.iconColor === undefined ? undefined : toApiColor(params.iconColor),
    name: params.name,
    parentId: params.parentId,
    scope: params.scope,
    status: params.status,
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
      {
        conflict: (_details, errorBody) => pendingItemsOf(errorBody),
        fields: body,
        unprocessable: (message) => {
          if (message === "Parent category is archived") {
            return new CategoryParentArchived();
          }

          if (message === "Category is archived") {
            return new CategoryArchived();
          }

          return undefined;
        },
      },
    );
  }
}

export default updateCategory;
