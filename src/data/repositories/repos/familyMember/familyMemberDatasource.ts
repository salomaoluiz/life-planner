import FamilyInviteModel from "@data/models/familyMember/FamilyInviteModel";
import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";

export interface FamilyMemberDatasource {
  deleteFamilyMember(id: string): Promise<void>;
  getFamilyMembers(familyId: string): Promise<FamilyMemberModel[]>;
  getInvite(inviteToken: string): Promise<FamilyInviteModel>;
  inviteFamilyMember(
    params: InviteFamilyMemberDatasourceParams,
  ): Promise<InviteFamilyMemberDatasourceResponse>;
  joinFamilyMember(params: JoinFamilyMemberDatasourceParams): Promise<void>;
}

interface InviteFamilyMemberDatasourceParams {
  email: string;
  familyId: string;
}

interface InviteFamilyMemberDatasourceResponse {
  inviteExpiresAt: string;
  inviteToken: string;
}

interface JoinFamilyMemberDatasourceParams {
  inviteToken: string;
}

export {
  InviteFamilyMemberDatasourceParams,
  InviteFamilyMemberDatasourceResponse,
  JoinFamilyMemberDatasourceParams,
};
