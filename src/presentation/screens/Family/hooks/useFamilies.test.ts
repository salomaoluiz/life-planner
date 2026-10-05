import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import { memberDTO, ownerUser } from "../mocks/index.mocks";
import { givenData, setup, spies } from "./mocks/index.mocks";

async function runFetch() {
  setup();
  return spies.useQuery.mock.calls[0][0].fetch() as Promise<FamilyViewModel[]>;
}

it("SHOULD key the query by families, members and the current user (never by a user lookup per member)", () => {
  setup();

  expect(spies.useQuery.mock.calls[0][0].cacheKey).toEqual([
    "families",
    "members",
    "user",
  ]);
});

it("SHOULD build one view model per family with a UI model per member", async () => {
  givenData();

  const result = await runFetch();

  expect(result).toHaveLength(1);
  expect(result[0].familyName).toBe("Test Family");
  expect(result[0].familyMembers.map((member) => member.id)).toEqual([
    "member-1",
    "member-3",
  ]);
});

it("SHOULD NOT call a user lookup per member (name/photo come from the members response)", async () => {
  givenData();

  await runFetch();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(spies.getMembers).toHaveBeenCalledTimes(1);
});

it("SHOULD give the owner Cancel actions on other rows and none on their own", async () => {
  givenData();

  const [family] = await runFetch();

  expect(family.isOwner).toBe(true);
  expect(family.familyMembers.map((member) => member.action)).toEqual([
    undefined,
    "CANCEL_INVITE",
  ]);
});

it("SHOULD pass the viewer to the view model AND give a non-owner no row actions", async () => {
  givenData();
  spies.getUser.mockResolvedValue({ ...ownerUser, id: "user-2" });
  spies.getMembers.mockResolvedValue([
    memberDTO(),
    memberDTO({
      id: "member-3",
      role: FamilyMemberRole.MEMBER,
      status: FamilyMemberStatus.JOINED,
      userId: "user-2",
    }),
  ]);

  const [family] = await runFetch();

  expect(family.isOwner).toBe(false);
  expect(family.menuAction).toBe("LEAVE");
  expect(family.familyMembers.map((member) => member.action)).toEqual([
    undefined,
    undefined,
  ]);
});

it("SHOULD return [] WHEN the user has no family", async () => {
  givenData();
  spies.getFamilies.mockResolvedValue([]);

  expect(await runFetch()).toEqual([]);
});

it("SHOULD refetch on focus only", () => {
  const unfocused = setup({ focused: false });
  expect(unfocused.refetch).not.toHaveBeenCalled();

  const focused = setup({ focused: true });
  expect(focused.refetch).toHaveBeenCalledTimes(1);
});
