import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";

interface IFamilyMemberEntity {
  email: string;
  familyId: string;
  id: string;
  inviteExpired: boolean;
  joinedAt?: Date;
  name?: string;
  photoUrl?: string;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
  userId?: string;
}

class FamilyMemberEntity {
  email: string;
  familyId: string;
  id: string;
  inviteExpired: boolean;
  joinedAt?: Date;
  name?: string;
  photoUrl?: string;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
  userId?: string;

  constructor(params: IFamilyMemberEntity) {
    this.id = params.id;
    this.familyId = params.familyId;
    this.email = params.email;
    this.inviteExpired = params.inviteExpired;
    this.joinedAt = params.joinedAt;
    this.name = params.name;
    this.photoUrl = params.photoUrl;
    this.role = params.role;
    this.status = params.status;
    this.userId = params.userId;
  }
}

export default FamilyMemberEntity;
