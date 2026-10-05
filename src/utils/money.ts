const CENTS = 100;

// 006: transaction value is an integer number of cents, > 0 and at most this.
const MAX_TRANSACTION_CENTS = 2147483647;

function centsToDecimal(cents: number): number {
  return cents / CENTS;
}

function centsToDecimalString(cents: number): string {
  return (cents / CENTS).toFixed(2);
}

// Both "234,90" and "234.90" are accepted; anything else is 0 (validation rejects 0).
function decimalStringToCents(text: string): number {
  const parsed = Number(text.trim().replace(",", "."));

  return Number.isFinite(parsed) ? Math.round(parsed * CENTS) : 0;
}

function decimalToCents(value: number): number {
  return Math.round(value * CENTS);
}

export {
  centsToDecimal,
  centsToDecimalString,
  decimalStringToCents,
  decimalToCents,
  MAX_TRANSACTION_CENTS,
};
