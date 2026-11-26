import {
  getStockSection,
  getStockSectionPath,
  STOCK_SECTIONS,
} from "./stockSections";

it("SHOULD list Items, Lists, Waste and Catalog in menu order", () => {
  expect(STOCK_SECTIONS.map((item) => item.section)).toEqual([
    "items",
    "lists",
    "waste",
    "catalog",
  ]);
});

it.each([
  ["/stock", "items"],
  ["/stock/", "items"],
  ["/stock/locations/abc", "items"],
  ["/stock/lists", "lists"],
  ["/stock/waste", "waste"],
  ["/stock/waste/", "waste"],
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
