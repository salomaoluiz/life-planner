interface IFamilyInviteEntity {
  email: string;
  emailMatches: boolean;
  familyId: string;
  familyName: string;
  inviteExpiresAt: Date;
}

class FamilyInviteEntity {
  email: string;
  emailMatches: boolean;
  familyId: string;
  familyName: string;
  inviteExpiresAt: Date;

  constructor(params: IFamilyInviteEntity) {
    this.email = params.email;
    this.emailMatches = params.emailMatches;
    this.familyId = params.familyId;
    this.familyName = params.familyName;
    this.inviteExpiresAt = params.inviteExpiresAt;
  }
}

export default FamilyInviteEntity;
