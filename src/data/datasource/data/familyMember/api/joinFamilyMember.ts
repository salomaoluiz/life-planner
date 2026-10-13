import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import {
  FamilyMemberAlreadyExists,
  InviteEmailMismatch,
  InviteExpired,
  InviteNotFound,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyMemberApiError from "./familyMemberApiError";

export type Params = Parameters<FamilyMemberDatasource["joinFamilyMember"]>[0];
export type Response = ReturnType<FamilyMemberDatasource["joinFamilyMember"]>;

async function joinFamilyMember(params: Params): Response {
  try {
    // Empty body: the API takes the user from the JWT and the time from the server.
    await api.post(
      `/v1/family-invites/${encodeURIComponent(params.inviteToken)}/accept`,
    );
  } catch (error) {
    return handleFamilyMemberApiError(
      error,
      { datasource: "FamilyMemberDatasource - joinFamilyMember" },
      {
        400: () => new InviteNotFound(),
        403: () => new InviteEmailMismatch(),
        404: () => new InviteNotFound(),
        409: () => new FamilyMemberAlreadyExists(),
        410: () => new InviteExpired(),
      },
    );
  }
}

export default joinFamilyMember;
