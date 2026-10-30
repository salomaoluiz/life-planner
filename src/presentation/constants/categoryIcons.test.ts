import {
  ALL_CATEGORY_ICONS,
  COMMON_CATEGORY_ICONS,
  iconLabel,
  iconLabelFor,
} from "./categoryIcons";

it("SHOULD list 18 icons with the first 12 as common", () => {
  expect(ALL_CATEGORY_ICONS).toHaveLength(18);
  expect(COMMON_CATEGORY_ICONS).toEqual(ALL_CATEGORY_ICONS.slice(0, 12));
});

it("SHOULD label an icon with spaces instead of dashes", () => {
  expect(iconLabel("medical-bag")).toBe("medical bag");
});

it("SHOULD label a catalog icon in the language of the app", () => {
  const icon = { labelEn: "Folder", labelPt: "Pasta" };

  expect(iconLabelFor(icon, "pt-BR")).toBe("Pasta");
  expect(iconLabelFor(icon, "en-US")).toBe("Folder");
});
