import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";

import { memberDTO } from "../mocks/index.mocks";
import FamilyMemberUIModel from "./FamilyMemberUIModel";

const owner = { isFamilyOwner: true, userId: "user-1" };
const member = { isFamilyOwner: false, userId: "user-2" };

describe("action matrix", () => {
  const ownerRow = memberDTO({
    role: FamilyMemberRole.OWNER,
    status: FamilyMemberStatus.JOINED,
    userId: "user-1",
  });
  const joinedRow = memberDTO({
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.JOINED,
    userId: "user-2",
  });
  const otherJoinedRow = memberDTO({
    id: "m3",
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.JOINED,
    userId: "user-3",
  });
  const pendingRow = memberDTO({
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.PENDING,
    userId: undefined,
  });
  const expiredRow = memberDTO({
    inviteExpired: true,
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.PENDING,
    userId: undefined,
  });

  it.each([
    ["owner on their own row", ownerRow, owner, undefined],
    ["owner on a joined member", joinedRow, owner, "REMOVE"],
    ["owner on a pending invite", pendingRow, owner, "CANCEL_INVITE"],
    ["owner on an expired invite", expiredRow, owner, "CANCEL_INVITE"],
    ["member on the owner row", ownerRow, member, undefined],
    ["member on their own row", joinedRow, member, "LEAVE"],
    ["member on another member", otherJoinedRow, member, undefined],
    ["member on a pending invite", pendingRow, member, undefined],
  ] as const)(
    "SHOULD give the right action: %s",
    (_label, dto, viewer, expected) => {
      expect(new FamilyMemberUIModel(dto, viewer).action).toBe(expected);
    },
  );

  it.each([
    ["REMOVE", joinedRow, owner, "family.member.remove"],
    ["CANCEL_INVITE", pendingRow, owner, "family.member.cancelInvite"],
    ["LEAVE", joinedRow, member, "family.member.leave"],
  ] as const)("SHOULD map %s to its label key", (_a, dto, viewer, key) => {
    expect(new FamilyMemberUIModel(dto, viewer).actionLabelKey).toBe(key);
  });

  it("SHOULD have no label key WHEN there is no action", () => {
    expect(
      new FamilyMemberUIModel(ownerRow, owner).actionLabelKey,
    ).toBeUndefined();
  });
});

describe("display", () => {
  it("SHOULD use the user name and photo for a joined member", () => {
    const ui = new FamilyMemberUIModel(
      memberDTO({ name: "Alice Test", photoUrl: "https://example.test/a.png" }),
      owner,
    );

    expect(ui.displayName).toBe("Alice Test");
    expect(ui.avatar).toEqual({
      mode: "image",
      source: "https://example.test/a.png",
    });
  });

  it("SHOULD fall back to the email AND a text avatar WHEN there is no name/photo (pending)", () => {
    const ui = new FamilyMemberUIModel(
      memberDTO({
        email: "bob@example.test",
        name: undefined,
        photoUrl: undefined,
      }),
      owner,
    );

    expect(ui.displayName).toBe("bob@example.test");
    expect(ui.avatar).toEqual({ mode: "text", source: "bob@example.test" });
  });

  it("SHOULD use a text avatar WHEN the photo url is an empty string", () => {
    const ui = new FamilyMemberUIModel(
      memberDTO({ name: "Alice Test", photoUrl: "" }),
      owner,
    );

    expect(ui.avatar).toEqual({ mode: "text", source: "Alice Test" });
  });

  it("SHOULD expose the member id", () => {
    expect(new FamilyMemberUIModel(memberDTO({ id: "m9" }), owner).id).toBe(
      "m9",
    );
  });
});

describe("status label", () => {
  it.each([
    [
      "owner row",
      { role: FamilyMemberRole.OWNER, status: FamilyMemberStatus.JOINED },
      "family.member.role.owner",
    ],
    [
      "pending",
      { role: FamilyMemberRole.MEMBER, status: FamilyMemberStatus.PENDING },
      "family.member.status.pending",
    ],
    [
      "pending but expired",
      {
        inviteExpired: true,
        role: FamilyMemberRole.MEMBER,
        status: FamilyMemberStatus.PENDING,
      },
      "family.member.status.expired",
    ],
    [
      "joined member",
      { role: FamilyMemberRole.MEMBER, status: FamilyMemberStatus.JOINED },
      undefined,
    ],
  ] as const)("SHOULD label the %s", (_label, overrides, key) => {
    expect(
      new FamilyMemberUIModel(memberDTO(overrides), owner).statusLabelKey,
    ).toBe(key);
  });
});
