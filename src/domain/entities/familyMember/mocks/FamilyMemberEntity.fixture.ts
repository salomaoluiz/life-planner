import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";

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
      inviteExpired: false,
      joinedAt: undefined,
      name: undefined,
      photoUrl: undefined,
      role: FamilyMemberRole.MEMBER,
      status: FamilyMemberStatus.PENDING,
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

  withInviteExpired(inviteExpired: boolean) {
    this.value.inviteExpired = inviteExpired;
    return this;
  }

  withJoinedAt(joinedAt: Date) {
    this.value.joinedAt = joinedAt;
    return this;
  }

  withName(name: string) {
    this.value.name = name;
    return this;
  }

  withPhotoUrl(photoUrl: string) {
    this.value.photoUrl = photoUrl;
    return this;
  }

  withRole(role: FamilyMemberRole) {
    this.value.role = role;
    return this;
  }

  withStatus(status: FamilyMemberStatus) {
    this.value.status = status;
    return this;
  }

  withUserId(userId: string) {
    this.value.userId = userId;
    return this;
  }
}

export default FamilyMemberEntityFixture;
