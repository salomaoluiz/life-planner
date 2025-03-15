import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";

export interface FamilyMemberDatasource {
  createFamilyMember(params: CreateFamilyMemberDatasourceParams): Promise<void>;
  deleteFamilyMember(id: string): Promise<void>;
  getFamilyMembers(familyId: string): Promise<FamilyMemberModel[]>;
  joinFamilyMember(params: JoinFamilyMemberDatasourceParams): Promise<void>;
}

interface CreateFamilyMemberDatasourceParams {
  email: string;
  familyId: string;
  inviteToken?: string;
  joinDate?: string;
  userId?: string;
}

interface JoinFamilyMemberDatasourceParams {
  inviteToken: string;
  joinDate: string;
  userId: string;
}

export { CreateFamilyMemberDatasourceParams, JoinFamilyMemberDatasourceParams };
