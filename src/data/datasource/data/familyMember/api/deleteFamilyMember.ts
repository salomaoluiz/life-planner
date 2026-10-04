import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import { FamilyNotFound } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyMemberApiError from "./familyMemberApiError";

export type Params = Parameters<
  FamilyMemberDatasource["deleteFamilyMember"]
>[0];
export type Response = ReturnType<FamilyMemberDatasource["deleteFamilyMember"]>;

async function deleteFamilyMember(id: Params): Response {
  try {
    await api.delete(`/v1/family-members/${id}`);
  } catch (error) {
    return handleFamilyMemberApiError(
      error,
      { datasource: "FamilyMemberDatasource - deleteFamilyMember", id },
      { 404: () => new FamilyNotFound() },
    );
  }
}

export default deleteFamilyMember;
