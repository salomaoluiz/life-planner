import { FieldInvalid } from "@domain/entities/errors";

const CENTS = 100;
const DECIMAL_TEXT = /^\d+(\.\d{1,2})?$/;

function centsToDecimal(cents: number): number {
  return cents / CENTS;
}

function centsToDecimalString(cents: number): string {
  return (cents / CENTS).toFixed(2);
}

function decimalStringToCents(value: string): number {
  // Both "234,90" and "234.90" are accepted; thousands separators are not.
  const normalized = value.trim().replace(",", ".");

  if (!DECIMAL_TEXT.test(normalized)) {
    throw new FieldInvalid({ value });
  }

  const cents = Math.round(Number(normalized) * CENTS);

  // Transaction values are strictly positive: "0" never needs a round trip to be rejected.
  if (cents <= 0) {
    throw new FieldInvalid({ value });
  }

  return cents;
}

function decimalToCents(value: number): number {
  return Math.round(value * CENTS);
}

export {
  centsToDecimal,
  centsToDecimalString,
  decimalStringToCents,
  decimalToCents,
};
