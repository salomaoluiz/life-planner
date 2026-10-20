import { TagDatasource } from "@data/repositories/repos/financial/tags/tagDatasource";
import { TagNameInUse } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TagDatasource["updateTag"]>[0];
export type Response = ReturnType<TagDatasource["updateTag"]>;

async function updateTag(params: Params): Response {
  const body = { name: params.name, scope: params.scope };

  if (Object.values(body).every((value) => value === undefined)) {
    return;
  }

  try {
    await api.patch(`/v1/finance/tags/${params.id}`, body);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "TagDatasource - updateTag", id: params.id },
      { conflict: () => new TagNameInUse(), fields: body },
    );
  }
}

export default updateTag;
