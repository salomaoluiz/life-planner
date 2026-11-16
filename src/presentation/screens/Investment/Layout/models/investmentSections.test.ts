import {
  getInvestmentSection,
  getInvestmentSectionPath,
  INVESTMENT_SECTIONS,
} from "./investmentSections";

it.each([
  ["/investments/overview", "overview"],
  ["/investments/overview/", "overview"],
  ["/investments", "assets"],
  ["/investments/", "assets"],
  ["/investments/asset/asset-1", "assets"],
  ["/investments/suggestions", "assets"],
  ["/", "overview"],
  ["/financial/overview", "overview"],
])("SHOULD map %s to the %s section", (pathname, expected) => {
  expect(getInvestmentSection(pathname)).toBe(expected);
});

it("SHOULD give each section its route path", () => {
  expect(getInvestmentSectionPath("overview")).toBe("/investments/overview");
  expect(getInvestmentSectionPath("assets")).toBe("/investments");
});

it("SHOULD list Overview first, then Assets, with icons AND rail testIDs", () => {
  expect(INVESTMENT_SECTIONS.map((item) => item.section)).toEqual([
    "overview",
    "assets",
  ]);
  expect(INVESTMENT_SECTIONS.map((item) => item.icon)).toEqual([
    "chart-box-outline",
    "format-list-bulleted",
  ]);
  INVESTMENT_SECTIONS.forEach((item) => {
    expect(item.testID).toBe(`navigation-rail-investment-${item.section}`);
    expect(getInvestmentSectionPath(item.section)).toBe(item.path);
  });
});
