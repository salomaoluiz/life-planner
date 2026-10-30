import CategoryIconModel from "./CategoryIconModel";

it("SHOULD map the API item", () => {
  expect(
    CategoryIconModel.fromJSON({
      common: true,
      group: "FOOD",
      labelEn: "Food",
      labelPt: "Comida",
      name: "food",
    }),
  ).toEqual({
    common: true,
    group: "FOOD",
    labelEn: "Food",
    labelPt: "Comida",
    name: "food",
  });
});

it("SHOULD fall back to the name as label and OTHER as group", () => {
  expect(CategoryIconModel.fromJSON({ name: "folder" })).toEqual({
    common: false,
    group: "OTHER",
    labelEn: "folder",
    labelPt: "folder",
    name: "folder",
  });
});
