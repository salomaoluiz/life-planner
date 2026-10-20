import { TagDatasource } from "@data/repositories/repos/financial/tags/tagDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TagDatasource["deleteTag"]>[0];
export type Response = ReturnType<TagDatasource["deleteTag"]>;

async function deleteTag(id: Params): Response {
  try {
    await api.delete(`/v1/finance/tags/${id}`);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TagDatasource - deleteTag",
      id,
    });
  }
}

export default deleteTag;
