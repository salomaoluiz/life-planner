import FamilyDTO from "@application/dto/family/FamilyDTO";

import { familyDTO, makeFamilyViewModel } from "../mocks/index.mocks";
import FamilyViewModel from "./FamilyViewModel";

it("SHOULD expose the family id and name", () => {
  const vm = makeFamilyViewModel();

  expect(vm.familyId).toBe("family-1");
  expect(vm.familyName).toBe("Test Family");
});

it("SHOULD build an uppercase initials avatar from the family name", () => {
  const dto = new FamilyDTO({ ...familyDTO, name: "the test family" });

  expect(new FamilyViewModel(dto, []).avatar).toEqual({
    mode: "text",
    source: "TTF",
  });
});

it("SHOULD find the owner among the members", () => {
  const vm = makeFamilyViewModel();

  expect(vm.owner.memberDto.id).toBe("member-1");
});

it("SHOULD have no owner WHEN no member belongs to the owner user", () => {
  const dto = new FamilyDTO({ ...familyDTO, ownerId: "someone-else" });

  expect(
    new FamilyViewModel(dto, makeFamilyViewModel().familyMembers).owner,
  ).toBeUndefined();
});

it("SHOULD have no owner WHEN the family has no members at all", () => {
  const dto = new FamilyDTO({ ...familyDTO });

  expect(new FamilyViewModel(dto, []).owner).toBeUndefined();
});
