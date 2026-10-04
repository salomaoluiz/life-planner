import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import { FamilyNotFound, FieldInvalid } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyApiError from "./familyApiError";

export type Params = Parameters<FamilyDatasource["updateFamily"]>[0];
export type Response = ReturnType<FamilyDatasource["updateFamily"]>;

async function updateFamily(params: Params): Response {
  try {
    await api.patch(`/v1/families/${params.id}`, { name: params.name });
  } catch (error) {
    return handleFamilyApiError(
      error,
      { datasource: "FamilyDatasource - updateFamily", id: params.id },
      {
        400: () => new FieldInvalid({ name: params.name }),
        404: () => new FamilyNotFound(),
      },
    );
  }
}

export default updateFamily;
