import FamilyInviteEntity from "@domain/entities/familyMember/FamilyInviteEntity";

export interface IFamilyInviteDTO {
  email: string;
  emailMatches: boolean;
  familyId: string;
  familyName: string;
  inviteExpiresAt: Date;
}

class FamilyInviteDTO {
  email: string;
  emailMatches: boolean;
  familyId: string;
  familyName: string;
  inviteExpiresAt: Date;

  constructor(params: IFamilyInviteDTO) {
    this.email = params.email;
    this.emailMatches = params.emailMatches;
    this.familyId = params.familyId;
    this.familyName = params.familyName;
    this.inviteExpiresAt = params.inviteExpiresAt;
  }

  static fromEntity(entity: FamilyInviteEntity) {
    return new FamilyInviteDTO({
      email: entity.email,
      emailMatches: entity.emailMatches,
      familyId: entity.familyId,
      familyName: entity.familyName,
      inviteExpiresAt: entity.inviteExpiresAt,
    });
  }
}

export default FamilyInviteDTO;
