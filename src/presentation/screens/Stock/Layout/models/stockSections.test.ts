import {
  getStockSection,
  getStockSectionPath,
  STOCK_SECTIONS,
} from "./stockSections";

it("SHOULD list Items, Lists and Catalog in menu order", () => {
  expect(STOCK_SECTIONS.map((item) => item.section)).toEqual([
    "items",
    "lists",
    "catalog",
  ]);
});

it.each([
  ["/stock", "items"],
  ["/stock/", "items"],
  ["/stock/locations/abc", "items"],
  ["/stock/lists", "lists"],
  ["/stock/list/abc", "lists"],
  ["/stock/lists/stock_add_to_list", "lists"],
  ["/stock/catalog", "catalog"],
  ["/somewhere", "items"],
])("SHOULD read %s as the %s section", (path, section) => {
  expect(getStockSection(path)).toBe(section);
});

it("SHOULD map a section to its path", () => {
  expect(getStockSectionPath("lists")).toBe("/stock/lists");
  expect(getStockSectionPath("catalog")).toBe("/stock/catalog");
  expect(getStockSectionPath("items")).toBe("/stock");
});
