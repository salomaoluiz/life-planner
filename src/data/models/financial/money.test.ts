import { FieldInvalid } from "@domain/entities/errors";

import {
  centsToDecimal,
  centsToDecimalString,
  decimalStringToCents,
  decimalToCents,
} from "./money";

describe("centsToDecimal / decimalToCents", () => {
  it.each([
    [152075, 1520.75],
    [-5050, -50.5],
    [0, 0],
    [1, 0.01],
  ])("SHOULD convert %i cents <-> %f", (cents, decimal) => {
    expect(centsToDecimal(cents)).toBe(decimal);
    expect(decimalToCents(decimal)).toBe(cents);
  });

  it("SHOULD round away binary float noise (0.29 * 100 = 28.999999999999996)", () => {
    expect(decimalToCents(0.29)).toBe(29);
    expect(decimalToCents(1.15)).toBe(115);
    expect(decimalToCents(19.99)).toBe(1999);
  });
});

describe("centsToDecimalString", () => {
  it.each([
    [23490, "234.90"],
    [5, "0.05"],
    [100, "1.00"],
  ])("SHOULD render %i cents as %s", (cents, text) => {
    expect(centsToDecimalString(cents)).toBe(text);
  });
});

describe("decimalStringToCents", () => {
  it.each([
    ["234.90", 23490],
    ["234,90", 23490],
    ["234.9", 23490],
    ["234", 23400],
    [" 234.90 ", 23490],
    ["0.29", 29],
    ["0,05", 5],
    ["19.99", 1999],
  ])("SHOULD convert %j to %i cents", (text, cents) => {
    expect(decimalStringToCents(text)).toBe(cents);
  });

  it.each([
    "",
    "   ",
    "abc",
    "-5",
    "1e3",
    "1.234,56",
    "12.345",
    "1,2,3",
    "R$ 10",
    ".5",
    "5.",
  ])("SHOULD throw FieldInvalid for %j", (text) => {
    expect(() => decimalStringToCents(text)).toThrow(FieldInvalid);
  });

  it("SHOULD throw FieldInvalid naming only the field (never the typed amount)", () => {
    expect(() => decimalStringToCents("abc")).toThrow(
      "The field value are invalid",
    );
  });

  it.each(["0", "0,00", "0.0"])(
    "SHOULD throw FieldInvalid for %j (values must be > 0, no network round trip)",
    (text) => {
      expect(() => decimalStringToCents(text)).toThrow(FieldInvalid);
    },
  );
});
