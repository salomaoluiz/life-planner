import FamilyDTO from "@application/dto/family/FamilyDTO";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { memberDTO } from "@screens/Family/mocks/index.mocks";

import { getConfirmCopy } from "./FamilyConfirm";
import FamilyMemberUIModel from "./FamilyMemberUIModel";
import FamilyViewModel from "./FamilyViewModel";

const viewer = { isFamilyOwner: true, userId: "user-1" };
const vm = new FamilyViewModel(
  new FamilyDTO({ id: "family-1", name: "Test Family", ownerId: "user-1" }),
  [],
  viewer,
);
const joined = new FamilyMemberUIModel(
  memberDTO({
    name: "Bob Test",
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.JOINED,
    userId: "user-2",
  }),
  viewer,
);
const pending = new FamilyMemberUIModel(
  memberDTO({
    email: "carol@example.test",
    name: undefined,
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.PENDING,
    userId: undefined,
  }),
  viewer,
);

it.each([
  [
    { kind: "DELETE_FAMILY" as const },
    "family.delete.title",
    "family.delete.message",
    "family.delete.confirm",
    { name: "Test Family" },
  ],
  [
    { kind: "LEAVE_FAMILY" as const },
    "family.leave.title",
    "family.leave.message",
    "family.member.leave",
    { name: "Test Family" },
  ],
  [
    { kind: "REMOVE_MEMBER" as const, member: joined },
    "family.removeMember.title",
    "family.removeMember.message",
    "family.member.remove",
    { name: "Bob Test" },
  ],
  [
    { kind: "CANCEL_INVITE" as const, member: pending },
    "family.cancelInvite.title",
    "family.cancelInvite.message",
    "family.member.cancelInvite",
    { email: "carol@example.test" },
  ],
])(
  "SHOULD give the copy FOR %j",
  (confirm, titleKey, messageKey, confirmLabelKey, params) => {
    expect(getConfirmCopy(confirm, vm)).toEqual({
      confirmLabelKey,
      messageKey,
      params,
      titleKey,
    });
  },
);
