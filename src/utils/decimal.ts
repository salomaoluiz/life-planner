// Exact decimals for quantities and unit prices (spec 102): up to 8 places over a scaled bigint, never floats.
const SCALE = 8;
const FACTOR = BigInt(10) ** BigInt(SCALE);
const ZERO = BigInt(0);
const DECIMAL_TEXT = /^\d+(\.\d{1,8})?$/;

// Shortest form with "." ("1200", "18.3572"); a negative value keeps its sign.
function formatDecimal(scaled: bigint): string {
  const negative = scaled < ZERO;
  const absolute = negative ? -scaled : scaled;
  const integer = absolute / FACTOR;
  const fraction = (absolute % FACTOR)
    .toString()
    .padStart(SCALE, "0")
    .replace(/0+$/, "");

  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

// round_half_up(a × b × 100): the cents of `quantity × unitPrice`.
function mulToCents(a: bigint, b: bigint): number {
  return Number(roundDiv(a * b, BigInt(10) ** BigInt(14)));
}

// Either "," or "." as separator; null when the text is not a non-negative decimal with up to 8 places.
function parseDecimal(value: string): bigint | null {
  const normalized = value.trim().replace(",", ".");

  if (!DECIMAL_TEXT.test(normalized)) {
    return null;
  }

  const [integer, fraction = ""] = normalized.split(".");

  return BigInt(integer) * FACTOR + BigInt(fraction.padEnd(SCALE, "0"));
}

// Integer division rounding half up for non-negative values.
function roundDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator * BigInt(2) + denominator) / (denominator * BigInt(2));
}

export { formatDecimal, mulToCents, parseDecimal, roundDiv, SCALE, ZERO };
