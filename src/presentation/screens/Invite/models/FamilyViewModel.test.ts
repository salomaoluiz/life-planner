import FamilyDTO from "@application/dto/family/FamilyDTO";
import UserDTO from "@application/dto/user/UserDTO";

import FamilyViewModel from "./FamilyViewModel";

const familyDTO = new FamilyDTO({
  id: "family-1",
  name: "Test Family",
  ownerId: "user-1",
});
const userDTO = new UserDTO({
  email: "bob@example.test",
  id: "user-2",
  name: "Bob Test",
  photoUrl: "",
});

function setup(email: string) {
  return new FamilyViewModel(familyDTO, userDTO, {
    email,
    familyId: "family-1",
    inviteDate: new Date("2025-01-01T00:00:00Z"),
  });
}

it("SHOULD expose the invited email and the family name", () => {
  const vm = setup("bob@example.test");

  expect(vm.email).toBe("bob@example.test");
  expect(vm.familyName).toBe("Test Family");
});

it("SHOULD be the same person WHEN the invite email matches the user email", () => {
  expect(setup("bob@example.test").isSamePerson).toBe(true);
});

it("SHOULD NOT be the same person WHEN the emails differ", () => {
  expect(setup("other@example.test").isSamePerson).toBe(false);
});
