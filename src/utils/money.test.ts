import {
  centsToDecimal,
  centsToDecimalString,
  decimalStringToCents,
  decimalToCents,
  MAX_TRANSACTION_CENTS,
} from "./money";

it("SHOULD convert cents to a decimal string with two places", () => {
  expect(centsToDecimalString(31290)).toBe("312.90");
  expect(centsToDecimalString(5)).toBe("0.05");
  expect(centsToDecimalString(0)).toBe("0.00");
});

it("SHOULD convert a decimal number to cents without float drift", () => {
  expect(decimalToCents(312.9)).toBe(31290);
  expect(decimalToCents(0.1 + 0.2)).toBe(30);
  expect(decimalToCents(-1520.75)).toBe(-152075);
});

it("SHOULD convert cents to a decimal number", () => {
  expect(centsToDecimal(152075)).toBe(1520.75);
  expect(centsToDecimal(-5)).toBe(-0.05);
});

it("SHOULD parse decimal text with dot or comma", () => {
  expect(decimalStringToCents("312.90")).toBe(31290);
  expect(decimalStringToCents("312,9")).toBe(31290);
  expect(decimalStringToCents(" 0.05 ")).toBe(5);
});

it("SHOULD return 0 for text that is not a number", () => {
  expect(decimalStringToCents("")).toBe(0);
  expect(decimalStringToCents("abc")).toBe(0);
});

it("SHOULD expose the 006 max transaction value", () => {
  expect(MAX_TRANSACTION_CENTS).toBe(2147483647);
});
