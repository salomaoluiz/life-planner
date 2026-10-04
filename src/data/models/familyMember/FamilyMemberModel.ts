interface IFamilyMemberModel {
  email: string;
  familyId: string;
  id: string;
  inviteExpired: boolean;
  joinedAt?: string;
  role: string;
  status: string;
  user?: { name: string; photoUrl?: string };
  userId?: string;
}

class FamilyMemberModel implements IFamilyMemberModel {
  email: string;
  familyId: string;
  id: string;
  inviteExpired: boolean;
  joinedAt?: string;
  role: string;
  status: string;
  user?: { name: string; photoUrl?: string };
  userId?: string;

  constructor(params: IFamilyMemberModel) {
    this.id = params.id;
    this.email = params.email;
    this.familyId = params.familyId;
    this.inviteExpired = params.inviteExpired;
    this.joinedAt = params.joinedAt;
    this.role = params.role;
    this.status = params.status;
    this.user = params.user;
    this.userId = params.userId;
  }

  static fromJSON(data: Record<string, unknown>): FamilyMemberModel {
    const user = data.user as null | {
      name: string;
      photoUrl?: null | string;
    };

    return new FamilyMemberModel({
      email: data.email as string,
      familyId: data.familyId as string,
      id: data.id as string,
      inviteExpired: data.inviteExpired as boolean,
      joinedAt: (data.joinedAt as null | string) ?? undefined,
      role: data.role as string,
      status: data.status as string,
      user: user
        ? { name: user.name, photoUrl: user.photoUrl ?? undefined }
        : undefined,
      userId: (data.userId as null | string) ?? undefined,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      email: this.email,
      familyId: this.familyId,
      id: this.id,
      inviteExpired: this.inviteExpired,
      joinedAt: this.joinedAt ?? null,
      role: this.role,
      status: this.status,
      user: this.user
        ? { name: this.user.name, photoUrl: this.user.photoUrl ?? null }
        : null,
      userId: this.userId ?? null,
    };
  }
}

export default FamilyMemberModel;
