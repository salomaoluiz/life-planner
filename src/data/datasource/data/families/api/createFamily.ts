import FamilyModel from "@data/models/family/FamilyModel";
import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import { FamilyNotCreated, FieldInvalid } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyApiError from "./familyApiError";

export type Params = Parameters<FamilyDatasource["createFamily"]>[0];
export type Response = ReturnType<FamilyDatasource["createFamily"]>;

async function createFamily(params: Params): Response {
  try {
    // The API takes the owner from the JWT and creates the owner's membership atomically.
    const data = await api.post<Record<string, unknown> | undefined>(
      "/v1/families",
      { name: params.name },
    );

    if (!data) {
      throw new FamilyNotCreated();
    }

    return FamilyModel.fromJSON(data);
  } catch (error) {
    return handleFamilyApiError(
      error,
      {
        datasource: "FamilyDatasource - createFamily",
        ownerId: params.ownerId,
      },
      { 400: () => new FieldInvalid({ name: params.name }) },
    );
  }
}

export default createFamily;
