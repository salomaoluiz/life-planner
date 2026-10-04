import UserDTO from "@application/dto/user/UserDTO";

import {
  invitedMemberDTO,
  ownerMemberDTO,
  ownerUser,
} from "../mocks/index.mocks";
import FamilyMemberViewModel from "./FamilyMembersViewModel";

it("SHOULD use the user name and photo WHEN the member has a user", () => {
  const vm = new FamilyMemberViewModel(ownerMemberDTO, ownerUser);

  expect(vm.familyMemberName).toBe("Alice Test");
  expect(vm.avatar).toEqual({
    mode: "image",
    source: "https://example.test/alice.png",
  });
});

it("SHOULD fall back to the email and a text avatar WHEN there is no user", () => {
  const vm = new FamilyMemberViewModel(invitedMemberDTO);

  expect(vm.familyMemberName).toBe("bob@example.test");
  expect(vm.avatar).toEqual({ mode: "text", source: "bob@example.test" });
});

it("SHOULD use a text avatar with an empty source WHEN the photo url is an empty string", () => {
  const user = new UserDTO({ ...ownerUser, photoUrl: "" });
  const vm = new FamilyMemberViewModel(ownerMemberDTO, user);

  // Pins current behavior: `??` does not fall back for "" (flagged in PR).
  expect(vm.avatar).toEqual({ mode: "text", source: "" });
});

it("SHOULD report the invite as accepted WHEN the user id matches the member", () => {
  expect(
    new FamilyMemberViewModel(ownerMemberDTO, ownerUser).acceptedInvite,
  ).toBe(true);
});

it("SHOULD report the invite as not accepted WHEN the user id differs", () => {
  const other = new UserDTO({ ...ownerUser, id: "user-2" });

  expect(new FamilyMemberViewModel(ownerMemberDTO, other).acceptedInvite).toBe(
    false,
  );
});

it("SHOULD report the invite as accepted WHEN there is neither a member user id nor a user", () => {
  // Pins current behavior: undefined === undefined (flagged in PR).
  expect(new FamilyMemberViewModel(invitedMemberDTO).acceptedInvite).toBe(true);
});
