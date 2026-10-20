import FamilyDTO from "@application/dto/family/FamilyDTO";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import {
  makeArchivedFamilyViewModel,
  makeFamilyViewModel,
  memberDTO,
} from "@screens/Family/mocks/index.mocks";

import { getConfirmCopy } from "./FamilyConfirm";
import FamilyMemberUIModel from "./FamilyMemberUIModel";
import FamilyViewModel from "./FamilyViewModel";

const ownerViewer = { isFamilyOwner: true, userId: "user-1" };
const memberViewer = { isFamilyOwner: false, userId: "user-2" };

function family(name = "Test Family") {
  return new FamilyDTO({ id: "family-1", name, ownerId: "user-1" });
}

function members(viewer: typeof ownerViewer) {
  return [
    new FamilyMemberUIModel(
      memberDTO({
        id: "m1",
        name: "Alice Test",
        role: FamilyMemberRole.OWNER,
        status: FamilyMemberStatus.JOINED,
        userId: "user-1",
      }),
      viewer,
    ),
    new FamilyMemberUIModel(
      memberDTO({
        id: "m2",
        name: "Bob Test",
        role: FamilyMemberRole.MEMBER,
        status: FamilyMemberStatus.JOINED,
        userId: "user-2",
      }),
      viewer,
    ),
    new FamilyMemberUIModel(
      memberDTO({
        email: "carol@example.test",
        id: "m3",
        name: undefined,
        role: FamilyMemberRole.MEMBER,
        status: FamilyMemberStatus.PENDING,
        userId: undefined,
      }),
      viewer,
    ),
  ];
}

it("SHOULD expose the family id and name", () => {
  const vm = new FamilyViewModel(family(), [], ownerViewer);

  expect(vm.familyId).toBe("family-1");
  expect(vm.familyName).toBe("Test Family");
});

it("SHOULD count only joined members (pending invites are not members)", () => {
  expect(
    new FamilyViewModel(family(), members(ownerViewer), ownerViewer)
      .joinedCount,
  ).toBe(2);
});

it("SHOULD build the owner subtitle FOR the owner viewer", () => {
  expect(
    new FamilyViewModel(family(), members(ownerViewer), ownerViewer).subtitle,
  ).toEqual({
    key: "family.card.membersOwnerYou_other",
    params: { count: 2, name: "Alice Test" },
  });
});

it("SHOULD name the owner FOR a member viewer", () => {
  const vm = new FamilyViewModel(family(), members(memberViewer), memberViewer);

  expect(vm.subtitle.key).toBe("family.card.membersOwner_other");
  expect(vm.subtitle.params.name).toBe("Alice Test");
  expect(vm.ownerName).toBe("Alice Test");
});

it("SHOULD give the menu action DELETE to the owner AND LEAVE to a member", () => {
  const asOwner = new FamilyViewModel(
    family(),
    members(ownerViewer),
    ownerViewer,
  );
  const asMember = new FamilyViewModel(
    family(),
    members(memberViewer),
    memberViewer,
  );

  expect(asOwner.menuAction).toBe("DELETE");
  expect(asOwner.menuActionLabelKey).toBe("family.delete.confirm");
  expect(asMember.menuAction).toBe("LEAVE");
  expect(asMember.menuActionLabelKey).toBe("family.member.leave");
  expect(asMember.currentMember?.id).toBe("m2");
});

it("SHOULD give a member NO menu WHEN their own row is not in the list", () => {
  const stranger = { isFamilyOwner: false, userId: "user-9" };
  const vm = new FamilyViewModel(family(), members(stranger), stranger);

  expect(vm.menuAction).toBeUndefined();
  expect(vm.menuActionLabelKey).toBeUndefined();
});

it.each([
  ["Test Family", "T"],
  ["  casa dos avós", "C"],
  ["🏠 Casa", "🏠"],
  ["ágata", "Á"],
])("SHOULD give ONE initial FOR %s", (name, initial) => {
  expect(new FamilyViewModel(family(name), [], ownerViewer).initial).toBe(
    initial,
  );
});

describe("archived family (spec 042)", () => {
  it("SHOULD give the owner Reactivate / Delete inline AND no menu or invite", () => {
    const archived = makeArchivedFamilyViewModel(ownerViewer);

    expect(archived.isArchived).toBe(true);
    expect(archived.canReactivate).toBe(true);
    expect(archived.canArchive).toBe(false);
    expect(archived.canInvite).toBe(false);
    expect(archived.menuAction).toBeUndefined();
    expect(archived.menuSecondaryLabelKey).toBeUndefined();
    expect(archived.familyMembers.every((member) => !member.action)).toBe(true);
  });

  it("SHOULD keep Leave for a member of an archived family", () => {
    const archived = makeArchivedFamilyViewModel(memberViewer);

    expect(archived.canReactivate).toBe(false);
    expect(archived.menuAction).toBe("LEAVE");
  });

  it("SHOULD let the owner of an active family archive from the menu", () => {
    const active = makeFamilyViewModel(ownerViewer);

    expect(active.canArchive).toBe(true);
    expect(active.canInvite).toBe(true);
    expect(active.menuAction).toBe("DELETE");
    expect(active.menuSecondaryLabelKey).toBe("family.archive.action");
  });

  it("SHOULD give the archive confirmation copy", () => {
    expect(
      getConfirmCopy(
        { kind: "ARCHIVE_FAMILY" },
        makeFamilyViewModel(ownerViewer),
      ),
    ).toMatchObject({
      confirmLabelKey: "family.archive.confirm",
      messageKey: "family.archive.message",
      titleKey: "family.archive.title",
    });
  });
});
