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
