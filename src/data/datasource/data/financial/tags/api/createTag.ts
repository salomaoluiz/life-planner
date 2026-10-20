import TagModel from "@data/models/financial/TagModel";
import { TagDatasource } from "@data/repositories/repos/financial/tags/tagDatasource";
import { TagNameInUse } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TagDatasource["createTag"]>[0];
export type Response = ReturnType<TagDatasource["createTag"]>;

async function createTag(params: Params): Response {
  const body = {
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      "/v1/finance/tags",
      body,
    );

    return TagModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "TagDatasource - createTag", ownerId: params.ownerId },
      { conflict: () => new TagNameInUse(), fields: body },
    );
  }
}

export default createTag;
