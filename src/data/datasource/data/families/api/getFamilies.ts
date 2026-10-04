import FamilyModel from "@data/models/family/FamilyModel";
import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import { api } from "@infrastructure/api";

import handleFamilyApiError from "./familyApiError";

export type Params = Parameters<FamilyDatasource["getFamilies"]>[0];
export type Response = ReturnType<FamilyDatasource["getFamilies"]>;

async function getFamilies(userId: Params): Response {
  try {
    // The API reads the current user from the JWT; userId is only kept for the interface.
    const data = await api.get<Record<string, unknown>[]>("/v1/families");

    return data.map((family) => FamilyModel.fromJSON(family));
  } catch (error) {
    return handleFamilyApiError(error, {
      datasource: "FamilyDatasource - getFamilies",
      userId,
    });
  }
}

export default getFamilies;
