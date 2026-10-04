interface IFamilyInviteModel {
  email: string;
  emailMatches: boolean;
  familyId: string;
  familyName: string;
  inviteExpiresAt: string;
}

class FamilyInviteModel implements IFamilyInviteModel {
  email: string;
  emailMatches: boolean;
  familyId: string;
  familyName: string;
  inviteExpiresAt: string;

  constructor(params: IFamilyInviteModel) {
    this.email = params.email;
    this.emailMatches = params.emailMatches;
    this.familyId = params.familyId;
    this.familyName = params.familyName;
    this.inviteExpiresAt = params.inviteExpiresAt;
  }

  static fromJSON(data: Record<string, unknown>): FamilyInviteModel {
    return new FamilyInviteModel({
      email: data.email as string,
      emailMatches: data.emailMatches as boolean,
      familyId: data.familyId as string,
      familyName: data.familyName as string,
      inviteExpiresAt: data.inviteExpiresAt as string,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      email: this.email,
      emailMatches: this.emailMatches,
      familyId: this.familyId,
      familyName: this.familyName,
      inviteExpiresAt: this.inviteExpiresAt,
    };
  }
}

export default FamilyInviteModel;
