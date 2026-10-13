import { familyNamed } from "@screens/Family/mocks/index.mocks";

import sortFamilies from "./sortFamilies";

it("SHOULD sort by name ignoring case and accents AND not mutate the input", () => {
  const input = [
    familyNamed("1", "casa"),
    familyNamed("2", "Álamo"),
    familyNamed("3", "Bela"),
  ];

  expect(sortFamilies(input).map((family) => family.familyName)).toEqual([
    "Álamo",
    "Bela",
    "casa",
  ]);
  expect(input.map((family) => family.familyId)).toEqual(["1", "2", "3"]);
});
