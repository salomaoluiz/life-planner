import { formatAmount, getCurrencyConfig, parseCents } from "./formatAmount";

it.each([
  ["pt-BR", "BRL", "pt-BR"],
  ["pt", "BRL", "pt-BR"],
  ["en-US", "USD", "en-US"],
  ["en", "USD", "en-US"],
  ["fr-FR", "USD", "en-US"],
] as const)("SHOULD map %s to %s", (tag, currency, locale) => {
  expect(getCurrencyConfig(tag)).toEqual({ currency, locale });
});

it("SHOULD format BRL with a regular space", () => {
  expect(formatAmount(123456, "pt-BR")).toBe("R$ 1.234,56");
  expect(formatAmount(123, "pt-BR")).toBe("R$ 1,23");
  expect(formatAmount(0, "pt-BR")).toBe("R$ 0,00");
});

it("SHOULD format USD for en-US", () => {
  expect(formatAmount(123456, "en-US")).toBe("$1,234.56");
});

it("SHOULD prefix the true minus for EXPENSE and plus for INCOME", () => {
  expect(formatAmount(31290, "pt-BR", "EXPENSE")).toBe("− R$ 312,90");
  expect(formatAmount(31290, "pt-BR", "INCOME")).toBe("+ R$ 312,90");
});

it("SHOULD not double the sign WHEN cents are negative and a type is given", () => {
  expect(formatAmount(-31290, "pt-BR", "EXPENSE")).toBe("− R$ 312,90");
});

it("SHOULD keep the Intl minus WHEN negative and no type", () => {
  expect(formatAmount(-500, "pt-BR")).toMatch(/^-\s?R\$ 5,00$|^-R\$ 5,00$/);
});

it("SHOULD show zero without a sign WHEN a type is given", () => {
  expect(formatAmount(0, "pt-BR", "EXPENSE")).toBe("R$ 0,00");
});

it("SHOULD parse typed digits into cents and cap at 12 digits", () => {
  expect(parseCents("R$ 1,23")).toBe(123);
  expect(parseCents("")).toBe(0);
  expect(parseCents("abc")).toBe(0);
  expect(parseCents("1234567890123")).toBe(123456789012);
});
