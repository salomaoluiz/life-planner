import TagModel from "@data/models/financial/TagModel";
import { TagDatasource } from "@data/repositories/repos/financial/tags/tagDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<TagDatasource["getTags"]>[0];
export type Response = ReturnType<TagDatasource["getTags"]>;

async function getTags(ownerIds: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/tags${toOwnerQuery(ownerIds)}`,
    );

    return data.map((tag) => TagModel.fromJSON(tag));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TagDatasource - getTags",
      ownerIds,
    });
  }
}

export default getTags;
