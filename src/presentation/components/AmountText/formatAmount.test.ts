import { formatAmount, parseCents } from "./formatAmount";

it.each([
  ["en-US", "BRL", "R$1,234.56"],
  ["pt-BR", "BRL", "R$ 1.234,56"],
  ["pt-BR", "USD", "US$ 1.234,56"],
  ["en-US", "USD", "$1,234.56"],
  ["en-US", "EUR", "€1,234.56"],
  ["pt-BR", "EUR", "€ 1.234,56"],
] as const)("SHOULD format %s + %s as %s", (tag, currency, expected) => {
  expect(formatAmount(123456, tag, currency)).toBe(expected);
});

it("SHOULD pick the number format from the language only (pt* is pt-BR, the rest en-US)", () => {
  expect(formatAmount(123456, "pt", "BRL")).toBe("R$ 1.234,56");
  expect(formatAmount(123456, "fr-FR", "BRL")).toBe("R$1,234.56");
});

it("SHOULD format BRL with a regular space", () => {
  expect(formatAmount(123, "pt-BR", "BRL")).toBe("R$ 1,23");
  expect(formatAmount(0, "pt-BR", "BRL")).toBe("R$ 0,00");
});

it("SHOULD prefix the true minus for EXPENSE and plus for INCOME", () => {
  expect(formatAmount(31290, "pt-BR", "BRL", "EXPENSE")).toBe("− R$ 312,90");
  expect(formatAmount(31290, "pt-BR", "BRL", "INCOME")).toBe("+ R$ 312,90");
  expect(formatAmount(500, "en-US", "BRL", "EXPENSE")).toBe("− R$5.00");
  expect(formatAmount(500, "en-US", "BRL", "INCOME")).toBe("+ R$5.00");
});

it("SHOULD not double the sign WHEN cents are negative and a type is given", () => {
  expect(formatAmount(-31290, "pt-BR", "BRL", "EXPENSE")).toBe("− R$ 312,90");
});

it("SHOULD keep the Intl minus WHEN negative and no type", () => {
  expect(formatAmount(-500, "pt-BR", "BRL")).toMatch(
    /^-\s?R\$ 5,00$|^-R\$ 5,00$/,
  );
});

it("SHOULD show zero without a sign WHEN a type is given", () => {
  expect(formatAmount(0, "pt-BR", "BRL", "EXPENSE")).toBe("R$ 0,00");
});

it("SHOULD parse typed digits into cents and cap at 12 digits", () => {
  expect(parseCents("R$ 1,23")).toBe(123);
  expect(parseCents("")).toBe(0);
  expect(parseCents("abc")).toBe(0);
  expect(parseCents("1234567890123")).toBe(123456789012);
});
