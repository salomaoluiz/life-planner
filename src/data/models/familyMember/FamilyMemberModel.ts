interface IFamilyMemberModel {
  email: string;
  familyId: string;
  id: string;
  inviteToken?: string;
  joinDate?: string;
  userId?: string;
}

class FamilyMemberModel implements IFamilyMemberModel {
  email: string;
  familyId: string;
  id: string;
  inviteToken?: string;
  joinDate?: string;
  userId?: string;

  constructor({
    email,
    familyId,
    id,
    inviteToken,
    joinDate,
    userId,
  }: IFamilyMemberModel) {
    this.id = id;
    this.email = email;
    this.familyId = familyId;
    this.joinDate = joinDate;
    this.userId = userId;
    this.inviteToken = inviteToken;
  }

  static fromJSON(data: Record<string, unknown>): FamilyMemberModel {
    return new FamilyMemberModel({
      email: data.email as string,
      familyId: data.family_id as string,
      id: data.id as string,
      inviteToken: data.invite_token as string,
      joinDate: data.join_date as string,
      userId: data.user_id as string,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      email: this.email,
      family_id: this.familyId,
      id: this.id,
      invite_token: this.inviteToken,
      join_date: this.joinDate,
      user_id: this.userId,
    };
  }
}

export default FamilyMemberModel;
