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

// The API rejects owner / ownerId on PATCH and depthLevel is computed server-side.
function categoryBody(params: Params) {
  return {
    icon: params.icon,
    iconColor:
      params.iconColor === undefined ? undefined : toApiColor(params.iconColor),
    name: params.name,
    parentId: params.parentId,
    scope: params.scope,
    status: params.status,
    type: params.type,
  };
}

function categoryErrorHandlers(body: Record<string, unknown>) {
  return {
    conflict: (_details: unknown, errorBody: Record<string, unknown>) =>
      pendingItemsOf(errorBody),
    fields: body,
    unprocessable: (message: string) => {
      if (message === "Parent category is archived") {
        return new CategoryParentArchived();
      }

      if (message === "Category is archived") {
        return new CategoryArchived();
      }

      return undefined;
    },
  };
}

// The 409 body lists what blocks the archive. Any other 409 (no blockers) stays a generic failure instead of
// an empty "resolve these items" dialog.
function pendingItemsOf(body: Record<string, unknown>) {
  if (typeof body.blockers !== "object" || body.blockers === null) {
    return undefined;
  }
  const blockers = body.blockers as Record<string, unknown>;

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
  const body = categoryBody(params);

  if (Object.values(body).every((value) => value === undefined)) {
    return;
  }

  try {
    await api.patch(`/v1/finance/categories/${params.id}`, body);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "CategoryDatasource - updateCategory", id: params.id },
      categoryErrorHandlers(body),
    );
  }
}

export { categoryBody, categoryErrorHandlers };
export default updateCategory;
