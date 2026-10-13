import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import { FamilyNotFound } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyMemberApiError from "./familyMemberApiError";

export type Params = Parameters<FamilyMemberDatasource["getFamilyMembers"]>[0];
export type Response = ReturnType<FamilyMemberDatasource["getFamilyMembers"]>;

async function getFamilyMembers(familyId: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/families/${familyId}/members`,
    );

    return data.map((member) => FamilyMemberModel.fromJSON(member));
  } catch (error) {
    return handleFamilyMemberApiError(
      error,
      { datasource: "FamilyMemberDatasource - getFamilyMembers", familyId },
      { 404: () => new FamilyNotFound() },
    );
  }
}

export default getFamilyMembers;
