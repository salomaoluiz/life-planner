import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

function sortFamilies(families: FamilyViewModel[]): FamilyViewModel[] {
  return [...families].sort((a, b) =>
    a.familyName.localeCompare(b.familyName, undefined, {
      sensitivity: "base",
    }),
  );
}

export default sortFamilies;
