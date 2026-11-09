// Spec 098 FR 3: the rate is derived from the two amounts (cents), with 4 decimals. `base` says which side is the
// unit: IN reads "1 <currency in> = value <currency out>" and OUT the other way, so `value` is always at least 1.
// Mirrors the API's `TransferRate` so the form shows the same number the server derives.
export interface TransferRate {
  base: "IN" | "OUT";
  value: number;
}

const DECIMALS = 10_000;

// A typed rate in the "1 <currency in> = rate <currency out>" direction fills the amount in (nearest cent).
function amountInFromRate(amountOutCents: number, rate: number) {
  if (!Number.isFinite(rate) || rate <= 0 || amountOutCents <= 0) {
    return 0;
  }

  return Math.round(amountOutCents / rate);
}

function computeRate(
  amountOutCents: number,
  amountInCents: number,
): TransferRate | undefined {
  if (amountOutCents <= 0 || amountInCents <= 0) {
    return undefined;
  }

  return amountOutCents >= amountInCents
    ? { base: "IN", value: round(amountOutCents / amountInCents) }
    : { base: "OUT", value: round(amountInCents / amountOutCents) };
}

// "5,4348" and "5.4348" are both accepted; anything else is 0.
function parseRate(text: string) {
  const parsed = Number(text.trim().replace(",", "."));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function round(value: number) {
  return Math.round(value * DECIMALS) / DECIMALS;
}

export { amountInFromRate, computeRate, parseRate };
