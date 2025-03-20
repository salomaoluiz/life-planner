import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";

interface IFamilyMemberDTO {
  email: string;
  familyId: string;
  id: string;
  joinedAt?: Date;
  userId?: string;
}

class FamilyMemberDTO {
  email: string;
  familyId: string;
  id: string;
  joinedAt?: Date;
  userId?: string;

  constructor(params: IFamilyMemberDTO) {
    this.id = params.id;
    this.familyId = params.familyId;
    this.email = params.email;
    this.userId = params.userId;
    this.joinedAt = params.joinedAt;
  }

  static fromEntity(familyMemberEntity: FamilyMemberEntity) {
    return new FamilyMemberDTO({
      email: familyMemberEntity.email,
      familyId: familyMemberEntity.familyId,
      id: familyMemberEntity.id,
      joinedAt: familyMemberEntity.joinedAt,
      userId: familyMemberEntity.userId,
    });
  }
}

export default FamilyMemberDTO;
