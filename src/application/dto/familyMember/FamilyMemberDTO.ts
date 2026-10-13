import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";

export interface IFamilyMemberDTO {
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

class FamilyMemberDTO {
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

  constructor(params: IFamilyMemberDTO) {
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

  static fromEntity(entity: FamilyMemberEntity) {
    return new FamilyMemberDTO({
      email: entity.email,
      familyId: entity.familyId,
      id: entity.id,
      inviteExpired: entity.inviteExpired,
      joinedAt: entity.joinedAt,
      name: entity.name,
      photoUrl: entity.photoUrl,
      role: entity.role,
      status: entity.status,
      userId: entity.userId,
    });
  }
}

export default FamilyMemberDTO;
