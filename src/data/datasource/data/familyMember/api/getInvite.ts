import FamilyInviteModel from "@data/models/familyMember/FamilyInviteModel";
import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import { InviteExpired, InviteNotFound } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyMemberApiError from "./familyMemberApiError";

export type Params = Parameters<FamilyMemberDatasource["getInvite"]>[0];
export type Response = ReturnType<FamilyMemberDatasource["getInvite"]>;

async function getInvite(inviteToken: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/family-invites/${encodeURIComponent(inviteToken)}`,
    );

    return FamilyInviteModel.fromJSON(data);
  } catch (error) {
    // No token in the context.
    return handleFamilyMemberApiError(
      error,
      { datasource: "FamilyMemberDatasource - getInvite" },
      {
        400: () => new InviteNotFound(),
        404: () => new InviteNotFound(),
        410: () => new InviteExpired(),
      },
    );
  }
}

export default getInvite;
