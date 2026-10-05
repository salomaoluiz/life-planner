import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { memberDTO } from "@screens/Family/mocks/index.mocks";

import FamilyMemberUIModel from "./FamilyMemberUIModel";

const owner = { isFamilyOwner: true, userId: "user-1" };
const member = { isFamilyOwner: false, userId: "user-2" };

const ownerRow = {
  role: FamilyMemberRole.OWNER,
  status: FamilyMemberStatus.JOINED,
  userId: "user-1",
};
const joined = {
  role: FamilyMemberRole.MEMBER,
  status: FamilyMemberStatus.JOINED,
  userId: "user-2",
};
const pending = {
  role: FamilyMemberRole.MEMBER,
  status: FamilyMemberStatus.PENDING,
  userId: undefined,
};

it.each([
  ["owner viewer, owner row", owner, ownerRow, undefined],
  ["owner viewer, joined row", owner, joined, "REMOVE"],
  ["owner viewer, pending row", owner, pending, "CANCEL_INVITE"],
  ["member viewer, owner row", member, ownerRow, undefined],
  ["member viewer, own row", member, joined, undefined],
  ["member viewer, pending row", member, pending, undefined],
])("SHOULD action be correct FOR %s", (_name, viewer, overrides, expected) => {
  expect(new FamilyMemberUIModel(memberDTO(overrides), viewer).action).toBe(
    expected,
  );
});

it.each([
  ["REMOVE", joined, "family.member.remove"],
  ["CANCEL_INVITE", pending, "family.member.cancelInvite"],
])("SHOULD actionLabelKey be the %s label", (_name, overrides, key) => {
  expect(
    new FamilyMemberUIModel(memberDTO(overrides), owner).actionLabelKey,
  ).toBe(key);
});

it("SHOULD have no actionLabelKey WHEN there is no action", () => {
  expect(
    new FamilyMemberUIModel(memberDTO(ownerRow), owner).actionLabelKey,
  ).toBeUndefined();
});

it.each([
  ["owner badge", ownerRow, "family.member.role.owner", "neutral"],
  ["pending badge", pending, "family.member.status.pending", "accent"],
  [
    "expired badge",
    { ...pending, inviteExpired: true },
    "family.member.status.expired",
    "expense",
  ],
  ["no badge for a joined member", joined, undefined, undefined],
])("SHOULD give the %s", (_name, overrides, key, tone) => {
  const ui = new FamilyMemberUIModel(memberDTO(overrides), owner);

  expect(ui.statusLabelKey).toBe(key);
  expect(ui.statusTone).toBe(tone);
});

it("SHOULD flag the current user row by user id", () => {
  expect(new FamilyMemberUIModel(memberDTO(joined), member).isCurrentUser).toBe(
    true,
  );
  expect(new FamilyMemberUIModel(memberDTO(joined), owner).isCurrentUser).toBe(
    false,
  );
  expect(
    new FamilyMemberUIModel(memberDTO(pending), member).isCurrentUser,
  ).toBe(false);
});

it("SHOULD use the name for joined members AND the email for pending ones", () => {
  const named = new FamilyMemberUIModel(
    memberDTO({ ...joined, email: "bob@example.test", name: "Bob Test" }),
    owner,
  );
  const invited = new FamilyMemberUIModel(
    memberDTO({ ...pending, email: "bob@example.test", name: undefined }),
    owner,
  );

  expect(named.displayName).toBe("Bob Test");
  expect(named.email).toBe("bob@example.test");
  expect(invited.displayName).toBe("bob@example.test");
  expect(invited.isPending).toBe(true);
});

it("SHOULD expose the photo only WHEN it is a non-empty string", () => {
  expect(
    new FamilyMemberUIModel(
      memberDTO({ ...joined, photoUrl: "https://example.test/a.png" }),
      owner,
    ).photoUrl,
  ).toBe("https://example.test/a.png");
  expect(
    new FamilyMemberUIModel(memberDTO({ ...joined, photoUrl: "" }), owner)
      .photoUrl,
  ).toBeUndefined();
});
