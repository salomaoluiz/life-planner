import {
  FINANCIAL_SECTIONS,
  getFinancialSection,
  getFinancialSectionPath,
} from "./financialSections";

it.each([
  ["/financial", "transactions"],
  ["/financial/", "transactions"],
  ["/financial/categories", "categories"],
  ["/financial/categories/", "categories"],
  ["/financial/tags", "tags"],
  ["/financial/tags/", "tags"],
  ["/financial/accounts", "accounts"],
  ["/financial/cards", "cards"],
  ["/financial/cards/", "cards"],
  ["/financial/unknown", "transactions"],
  ["/", "transactions"],
])("SHOULD map %s to the %s section", (pathname, expected) => {
  expect(getFinancialSection(pathname)).toBe(expected);
});

it("SHOULD give each section its route path", () => {
  expect(getFinancialSectionPath("transactions")).toBe("/financial");
  expect(getFinancialSectionPath("categories")).toBe("/financial/categories");
  expect(getFinancialSectionPath("tags")).toBe("/financial/tags");
  expect(getFinancialSectionPath("accounts")).toBe("/financial/accounts");
  expect(getFinancialSectionPath("cards")).toBe("/financial/cards");
});

it("SHOULD list the sections in menu order with icons AND rail testIDs", () => {
  expect(FINANCIAL_SECTIONS.map((item) => item.section)).toEqual([
    "transactions",
    "categories",
    "tags",
    "accounts",
    "cards",
  ]);
  expect(FINANCIAL_SECTIONS.map((item) => item.icon)).toEqual([
    "swap-vertical",
    "shape-outline",
    "tag-outline",
    "bank-outline",
    "credit-card-outline",
  ]);
  FINANCIAL_SECTIONS.forEach((item) => {
    expect(item.testID).toBe(`navigation-rail-financial-${item.section}`);
    expect(getFinancialSectionPath(item.section)).toBe(item.path);
  });
});
