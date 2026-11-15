import { getInvestmentSection } from "./sections";

it.each([
  ["/investments", "overview"],
  ["/investments/overview", "overview"],
  ["/investments/assets", "assets"],
  ["/investments/asset/abc", "assets"],
])("SHOULD read %s as the %s section", (pathname, expected) => {
  expect(getInvestmentSection(pathname)).toBe(expected);
});
