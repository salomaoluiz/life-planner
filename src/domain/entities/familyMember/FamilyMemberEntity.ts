interface IFamilyMemberEntity {
  email: string;
  familyId: string;
  id: string;
  joinedAt?: Date;
  userId?: string;
}

class FamilyMemberEntity {
  email: string;
  familyId: string;
  id: string;
  joinedAt?: Date;
  userId?: string;

  constructor({ email, familyId, id, joinedAt, userId }: IFamilyMemberEntity) {
    this.id = id;
    this.familyId = familyId;
    this.email = email;
    this.userId = userId;
    this.joinedAt = joinedAt;
  }
}

export default FamilyMemberEntity;
