import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";

class FamilyMemberEntityFixture {
  value = {} as FamilyMemberEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as FamilyMemberEntity;
  }

  withDefault() {
    this.value = {
      email: "teste@gmail.com",
      familyId: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      id: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      joinedAt: undefined,
      userId: undefined,
    };
  }

  withEmail(email: string) {
    this.value.email = email;
    return this;
  }

  withFamilyId(familyId: string) {
    this.value.familyId = familyId;
    return this;
  }

  withId(id: string) {
    this.value.id = id;
    return this;
  }

  withJoinedAt(joinedAt: Date) {
    this.value.joinedAt = joinedAt;
    return this;
  }

  withUserId(userId: string) {
    this.value.userId = userId;
    return this;
  }
}

export default FamilyMemberEntityFixture;
