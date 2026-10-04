import FamilyModel from "@data/models/family/FamilyModel";
import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import { FamilyNotFound, FieldInvalid } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyApiError from "./familyApiError";

export type Params = Parameters<FamilyDatasource["getFamilyById"]>[0];
export type Response = ReturnType<FamilyDatasource["getFamilyById"]>;

async function getFamilyById(familyId: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/families/${familyId}`,
    );

    return FamilyModel.fromJSON(data);
  } catch (error) {
    return handleFamilyApiError(
      error,
      { datasource: "FamilyDatasource - getFamilyById", familyId },
      {
        400: () => new FieldInvalid({ familyId }),
        404: () => new FamilyNotFound(),
      },
    );
  }
}

export default getFamilyById;
