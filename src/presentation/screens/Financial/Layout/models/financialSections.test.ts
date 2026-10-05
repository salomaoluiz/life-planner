import {
  getFinancialSection,
  getFinancialSectionPath,
} from "./financialSections";

it.each([
  ["/financial", "transactions"],
  ["/financial/", "transactions"],
  ["/financial/categories", "categories"],
  ["/financial/categories/", "categories"],
  ["/financial/accounts", "accounts"],
  ["/financial/unknown", "transactions"],
  ["/", "transactions"],
])("SHOULD map %s to the %s section", (pathname, expected) => {
  expect(getFinancialSection(pathname)).toBe(expected);
});

it("SHOULD give each section its route path", () => {
  expect(getFinancialSectionPath("transactions")).toBe("/financial");
  expect(getFinancialSectionPath("categories")).toBe("/financial/categories");
  expect(getFinancialSectionPath("accounts")).toBe("/financial/accounts");
});
