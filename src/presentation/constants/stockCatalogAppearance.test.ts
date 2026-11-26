import {
  appearanceFields,
  CATEGORY_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
  selectedKeys,
} from "./stockCatalogAppearance";

it("SHOULD list the nine categories and five locations of the backend table", () => {
  expect(CATEGORY_SUGGESTIONS).toHaveLength(9);
  expect(LOCATION_SUGGESTIONS.map((entry) => entry.key)).toEqual([
    "PANTRY",
    "FRIDGE",
    "FREEZER",
    "LAUNDRY",
    "GARAGE",
  ]);
  expect(CATEGORY_SUGGESTIONS[0]).toMatchObject({
    color: "#F59E0B",
    icon: "cart",
  });
});

it("SHOULD select everything except what was unchecked", () => {
  expect(selectedKeys(LOCATION_SUGGESTIONS, [])).toHaveLength(5);
  expect(selectedKeys(LOCATION_SUGGESTIONS, ["FRIDGE", "GARAGE"])).toEqual([
    "PANTRY",
    "FREEZER",
    "LAUNDRY",
  ]);
});

it("SHOULD build the appearance fields of a payload", () => {
  expect(appearanceFields("#112233", "cart")).toEqual({
    color: "#112233",
    icon: "cart",
  });
});
