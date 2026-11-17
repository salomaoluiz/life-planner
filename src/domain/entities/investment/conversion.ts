import {
  InvestmentAssetClass,
  wholeUnitsAfterEvent,
} from "@domain/entities/investment/enums";
import { averagePriceOf } from "@domain/entities/investment/position";
import {
  formatDecimal,
  parseDecimal,
  roundDiv,
  SCALE,
  ZERO,
} from "@utils/decimal";

const FACTOR = BigInt(10) ** BigInt(SCALE);
const HUNDRED = BigInt(100);

// Spec 112 FR 9-10, 15: ports the API's `ConversionMath` for the modal preview; the API result stays the source of
// truth after saving. The origin side is the whole position at the record date (a conversion needs no later
// operations, so it is the current position).
export interface ConversionDraft {
  assetClass: InvestmentAssetClass;
  // Cents and the value of one destination quota; both set, or no cash part.
  cash?: null | { amount: number; referenceUnitValue: string };
  // The destination as it is now; null for a destination created in the modal.
  destination: null | { cost: number; quantity: string };
  origin: { cost: number; quantity: string };
  ratioFrom: string;
  ratioTo: string;
}

export interface ConversionPreview {
  // Cents of the origin cost the cash part takes.
  cashCost: number;
  costIn: number;
  destinationAfter: {
    averagePrice: null | string;
    cost: number;
    quantity: string;
  };
  fractionCost: number;
  fractionQuantity: string;
  quantityIn: string;
  // `quantityOut × ratioTo / ratioFrom`, floored to 8 places.
  raw: string;
  // The origin's realized result: the cash part minus the cost it took.
  realizedOut: number;
}

export function previewConversion(
  draft: ConversionDraft,
): ConversionPreview | null {
  const quantityOut = parseDecimal(draft.origin.quantity);
  const from = parseDecimal(draft.ratioFrom);
  const to = parseDecimal(draft.ratioTo);

  if (
    quantityOut === null ||
    quantityOut <= ZERO ||
    from === null ||
    to === null ||
    from <= ZERO ||
    to <= ZERO
  ) {
    return null;
  }

  const raw = (quantityOut * to) / from;
  const quantityIn = wholeUnitsAfterEvent(draft.assetClass)
    ? (raw / FACTOR) * FACTOR
    : raw;
  const fraction = raw - quantityIn;
  const cashCost = cashCostOf(draft.origin.cost, raw, draft.cash ?? null);

  if (cashCost === null) {
    return null;
  }

  const costIn = draft.origin.cost - cashCost;
  const fractionCost =
    raw === ZERO ? 0 : Number(roundDiv(BigInt(costIn) * fraction, raw));
  const destinationQuantity = parseDecimal(draft.destination?.quantity ?? "0");
  const quantityAfter = (destinationQuantity ?? ZERO) + quantityIn;
  const costAfter = (draft.destination?.cost ?? 0) + costIn - fractionCost;

  return {
    cashCost,
    costIn,
    destinationAfter: {
      averagePrice: averagePriceOf(costAfter, quantityAfter),
      cost: costAfter,
      quantity: formatDecimal(quantityAfter),
    },
    fractionCost,
    fractionQuantity: formatDecimal(fraction),
    quantityIn: formatDecimal(quantityIn),
    raw: formatDecimal(raw),
    realizedOut: draft.cash ? draft.cash.amount - cashCost : 0,
  };
}

// cost × cash / (cash + raw × reference × 100); null when the reference value is not a positive decimal.
function cashCostOf(
  cost: number,
  raw: bigint,
  cash: ConversionDraft["cash"],
): null | number {
  if (!cash) {
    return 0;
  }

  const reference = parseDecimal(cash.referenceUnitValue);

  if (reference === null || reference <= ZERO || cash.amount <= 0) {
    return null;
  }

  const quotasValue = roundDiv(raw * reference * HUNDRED, FACTOR * FACTOR);

  return Number(
    roundDiv(
      BigInt(cost) * BigInt(cash.amount),
      BigInt(cash.amount) + quotasValue,
    ),
  );
}
