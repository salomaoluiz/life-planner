import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import { FamilyHasRecords, FamilyNotFound } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyApiError from "./familyApiError";

export type Params = Parameters<FamilyDatasource["deleteFamily"]>[0];
export type Response = ReturnType<FamilyDatasource["deleteFamily"]>;

async function deleteFamily(id: Params): Response {
  try {
    await api.delete(`/v1/families/${id}`);
  } catch (error) {
    return handleFamilyApiError(
      error,
      { datasource: "FamilyDatasource - deleteFamily", id },
      {
        404: () => new FamilyNotFound(),
        409: () => new FamilyHasRecords(),
      },
    );
  }
}

export default deleteFamily;
