import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import {
  FamilyMemberAlreadyExists,
  FamilyNotFound,
  FieldInvalid,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyMemberApiError from "./familyMemberApiError";

export type Params = Parameters<
  FamilyMemberDatasource["inviteFamilyMember"]
>[0];
export type Response = ReturnType<FamilyMemberDatasource["inviteFamilyMember"]>;

async function inviteFamilyMember(params: Params): Response {
  try {
    const data = await api.post<Record<string, unknown>>(
      `/v1/families/${params.familyId}/members`,
      { email: params.email },
    );

    return {
      inviteExpiresAt: data.inviteExpiresAt as string,
      inviteToken: data.inviteToken as string,
    };
  } catch (error) {
    // Context holds ids only: never the email or the token.
    return handleFamilyMemberApiError(
      error,
      {
        datasource: "FamilyMemberDatasource - inviteFamilyMember",
        familyId: params.familyId,
      },
      {
        400: () => new FieldInvalid({ email: params.email }),
        404: () => new FamilyNotFound(),
        409: () => new FamilyMemberAlreadyExists(),
      },
    );
  }
}

export default inviteFamilyMember;
