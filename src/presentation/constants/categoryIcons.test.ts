import {
  ALL_CATEGORY_ICONS,
  COMMON_CATEGORY_ICONS,
  filterIcons,
  iconLabel,
} from "./categoryIcons";

it("SHOULD list 18 icons with the first 12 as common", () => {
  expect(ALL_CATEGORY_ICONS).toHaveLength(18);
  expect(COMMON_CATEGORY_ICONS).toEqual(ALL_CATEGORY_ICONS.slice(0, 12));
});

it("SHOULD label an icon with spaces instead of dashes", () => {
  expect(iconLabel("medical-bag")).toBe("medical bag");
});

it("SHOULD filter icons ignoring case on the label", () => {
  expect(filterIcons(ALL_CATEGORY_ICONS, "BAG")).toEqual(["medical-bag"]);
});

it("SHOULD return every icon WHEN the query is empty", () => {
  expect(filterIcons(ALL_CATEGORY_ICONS, "  ")).toEqual(ALL_CATEGORY_ICONS);
});

it("SHOULD return an empty list WHEN nothing matches", () => {
  expect(filterIcons(ALL_CATEGORY_ICONS, "zzz")).toEqual([]);
});
