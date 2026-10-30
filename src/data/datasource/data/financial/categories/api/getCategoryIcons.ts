import CategoryIconModel from "@data/models/financial/CategoryIconModel";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<CategoryDatasource["getCategoryIcons"]>[0];
export type Response = ReturnType<CategoryDatasource["getCategoryIcons"]>;

async function getCategoryIcons(params: Params): Response {
  const query = new URLSearchParams();
  const text = params.q?.trim();

  if (text) {
    query.set("q", text);
  }
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  const suffix = query.toString();

  try {
    const data = await api.get<{ items: Record<string, unknown>[] }>(
      `/v1/finance/category-icons${suffix ? `?${suffix}` : ""}`,
    );

    return data.items.map((item) => CategoryIconModel.fromJSON(item));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "CategoryDatasource - getCategoryIcons",
    });
  }
}

export default getCategoryIcons;
