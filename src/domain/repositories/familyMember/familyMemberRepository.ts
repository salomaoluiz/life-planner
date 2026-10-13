import FamilyInviteEntity from "@domain/entities/familyMember/FamilyInviteEntity";
import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";

export type FamilyMemberRepository = {
  deleteFamilyMember(id: string): Promise<void>;
  getFamilyMembers(familyId: string): Promise<FamilyMemberEntity[]>;
  getInvite(inviteToken: string): Promise<FamilyInviteEntity>;
  inviteFamilyMember(
    params: InviteFamilyMemberRepositoryParams,
  ): Promise<InviteFamilyMemberRepositoryResponse>;
  joinFamilyMember(params: JoinFamilyMemberRepositoryParams): Promise<void>;
};

interface InviteFamilyMemberRepositoryParams {
  email: string;
  familyId: string;
}

interface InviteFamilyMemberRepositoryResponse {
  inviteExpiresAt: Date;
  inviteToken: string;
}

interface JoinFamilyMemberRepositoryParams {
  inviteToken: string;
}

export {
  InviteFamilyMemberRepositoryParams,
  InviteFamilyMemberRepositoryResponse,
  JoinFamilyMemberRepositoryParams,
};
