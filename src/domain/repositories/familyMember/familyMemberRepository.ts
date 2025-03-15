import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";

export type FamilyMemberRepository = {
  createFamilyMember(params: CreateFamilyMemberRepositoryParams): Promise<void>;
  deleteFamilyMember(id: string): Promise<void>;
  getFamilyMembers(familyId: string): Promise<FamilyMemberEntity[]>;
  joinFamilyMember(params: JoinFamilyMemberRepositoryParams): Promise<void>;
};

interface CreateFamilyMemberRepositoryParams {
  email: string;
  familyId: string;
  inviteToken?: string;
  joinDate?: string;
  userId?: string;
}

interface JoinFamilyMemberRepositoryParams {
  inviteToken: string;
  joinDate: string;
  userId: string;
}
