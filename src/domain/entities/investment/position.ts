import {
  InvestmentAssetClass,
  InvestmentOperationType,
  isInvestmentEvent,
  wholeUnitsAfterEvent,
} from "@domain/entities/investment/enums";
import {
  InvestmentFee,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import {
  formatDecimal,
  mulToCents,
  parseDecimal,
  roundDiv,
  SCALE,
  ZERO,
} from "@utils/decimal";

const FACTOR = BigInt(10) ** BigInt(SCALE);

// Spec 108: the numbers an event is previewed from (ratio, or percent with an optional cost per new share).
export interface EventDraft {
  bonusPercent?: string;
  bonusUnitCost?: string;
  // `YYYY-MM-DD`, the data-com.
  date: string;
  ratioFrom?: string;
  ratioTo?: string;
  type: InvestmentOperationType;
}

export interface EventPreview {
  averagePriceAfter: null | string;
  averagePriceBefore: null | string;
  costAfter: number;
  costBefore: number;
  fractionCost: number;
  fractionQuantity: string;
  quantityAfter: string;
  quantityBefore: string;
}

// Ports the API's PositionCalculator (spec 102 FR 14-15) so the operation form previews what the API will answer;
// the API result stays the source of truth after saving.
export interface OperationDraft {
  // `YYYY-MM-DD`
  date: string;
  // Cents of every fee.
  fees: number[];
  quantity: string;
  type: InvestmentOperationType;
  unitPrice: string;
}

export interface OperationPreview {
  // Quantity held on the draft date, before the draft.
  availableQuantity: string;
  // The average price after the draft (buy) or unchanged (sell); null at zero quantity.
  averagePrice: null | string;
  // The sell asks for more than what is held on its date.
  insufficient: boolean;
  quantityAfter: string;
  // Sell only; null on a buy or when insufficient.
  realizedResult: null | number;
  totals: OperationTotals;
}

export interface OperationTotals {
  feesExceedSale: boolean;
  feesTotal: number;
  gross: number;
  total: number;
}

interface EventFields {
  bonusPercent?: string;
  bonusUnitCost?: string;
  ratioFrom?: string;
  ratioTo?: string;
}

interface EventStep {
  costAfter: number;
  costBefore: number;
  fractionCost: number;
  fractionQuantity: bigint;
  quantityAfter: bigint;
  quantityBefore: bigint;
}

interface Step {
  date: string;
  event?: EventFields;
  fractionSale: boolean;
  quantity: bigint;
  total: number;
  type: InvestmentOperationType;
}

const HUNDRED = BigInt(100);

export function computeTotals(
  type: InvestmentOperationType,
  quantity: string,
  unitPrice: string,
  fees: number[],
): OperationTotals {
  const q = parseDecimal(quantity);
  const p = parseDecimal(unitPrice);
  const gross = q !== null && p !== null ? mulToCents(q, p) : 0;
  const feesTotal = fees.reduce((sum, amount) => sum + amount, 0);
  const total =
    type === InvestmentOperationType.BUY
      ? gross + feesTotal
      : gross - feesTotal;

  return {
    feesExceedSale: type === InvestmentOperationType.SELL && total < 0,
    feesTotal,
    gross,
    total: Math.max(total, 0),
  };
}

export function feeAmounts(fees: Pick<InvestmentFee, "amount">[]): number[] {
  return fees.map((fee) => fee.amount);
}

// Spec 108 FR 10-13: ports `CorporateEventMath`. `existing` is the asset's operations as the API returns them.
export function previewEvent(
  existing: InvestmentOperation[],
  assetClass: InvestmentAssetClass,
  draft: EventDraft,
): EventPreview | null {
  const before = replay(
    toSteps(existing).filter((step) => step.date <= draft.date),
    assetClass,
  );

  if (before.quantity <= ZERO) {
    return null;
  }

  const applied = applyEvent(draft, before.quantity, before.cost, assetClass);

  return applied
    ? {
        averagePriceAfter: averagePriceOf(
          applied.costAfter,
          applied.quantityAfter,
        ),
        averagePriceBefore: averagePriceOf(
          applied.costBefore,
          applied.quantityBefore,
        ),
        costAfter: applied.costAfter,
        costBefore: applied.costBefore,
        fractionCost: applied.fractionCost,
        fractionQuantity: formatDecimal(applied.fractionQuantity),
        quantityAfter: formatDecimal(applied.quantityAfter),
        quantityBefore: formatDecimal(applied.quantityBefore),
      }
    : null;
}

// `existing` is the asset's operations as the API returns them (newest first), WITHOUT the one being edited.
export function previewOperation(
  existing: InvestmentOperation[],
  draft: OperationDraft,
  assetClass: InvestmentAssetClass = InvestmentAssetClass.PRIVATE,
): OperationPreview {
  const totals = computeTotals(
    draft.type,
    draft.quantity,
    draft.unitPrice,
    draft.fees,
  );
  const quantity = parseDecimal(draft.quantity) ?? ZERO;
  const before = replay(
    toSteps(existing).filter((step) => step.date <= draft.date),
    assetClass,
  );

  if (draft.type === InvestmentOperationType.BUY) {
    const after = {
      cost: before.cost + totals.total,
      quantity: before.quantity + quantity,
    };

    return {
      availableQuantity: formatDecimal(before.quantity),
      averagePrice: averagePriceOf(after.cost, after.quantity),
      insufficient: false,
      quantityAfter: formatDecimal(after.quantity),
      realizedResult: null,
      totals,
    };
  }

  const insufficient = quantity > before.quantity;
  const costRemoved = insufficient
    ? 0
    : removedCost(before.cost, quantity, before.quantity);

  return {
    availableQuantity: formatDecimal(before.quantity),
    averagePrice: averagePriceOf(before.cost, before.quantity),
    insufficient,
    quantityAfter: formatDecimal(
      insufficient ? before.quantity : before.quantity - quantity,
    ),
    realizedResult: insufficient ? null : totals.total - costRemoved,
    totals,
  };
}

function applyEvent(
  draft:
    | EventDraft
    | (EventFields & { date: string; type: InvestmentOperationType }),
  quantity: bigint,
  cost: number,
  assetClass: InvestmentAssetClass,
): EventStep | null {
  const whole = wholeUnitsAfterEvent(assetClass);

  if (draft.type === InvestmentOperationType.BONUS) {
    const percent = parseDecimal(draft.bonusPercent ?? "");

    if (percent === null || percent <= ZERO) {
      return null;
    }

    const unit = parseDecimal(draft.bonusUnitCost ?? "0") ?? ZERO;
    const rawNew = (quantity * percent) / (HUNDRED * FACTOR);
    const added = floorToStep(rawNew, whole);
    const fraction = rawNew - added;
    const scale = FACTOR * FACTOR;
    const addedCost = Number(roundDiv(rawNew * unit * HUNDRED, scale));
    const fractionCost = Number(roundDiv(fraction * unit * HUNDRED, scale));

    return {
      costAfter: cost + addedCost - fractionCost,
      costBefore: cost,
      fractionCost,
      fractionQuantity: fraction,
      quantityAfter: quantity + added,
      quantityBefore: quantity,
    };
  }

  const from = parseDecimal(draft.ratioFrom ?? "");
  const to = parseDecimal(draft.ratioTo ?? "");

  if (from === null || to === null || from <= ZERO || to <= ZERO) {
    return null;
  }

  const raw = (quantity * to) / from;
  const kept = floorToStep(raw, whole);
  const fraction = raw - kept;
  const fractionCost =
    raw === ZERO ? 0 : Number(roundDiv(BigInt(cost) * fraction, raw));

  return {
    costAfter: cost - fractionCost,
    costBefore: cost,
    fractionCost,
    fractionQuantity: fraction,
    quantityAfter: kept,
    quantityBefore: quantity,
  };
}

// cost / quantity / 100 as an 8-place decimal string; null with no quantity.
function averagePriceOf(cost: number, quantity: bigint): null | string {
  if (quantity === ZERO) {
    return null;
  }

  const scaled = roundDiv(
    BigInt(cost) * BigInt(10) ** BigInt(16),
    quantity * BigInt(100),
  );

  return formatDecimal(scaled);
}

function floorToStep(value: bigint, whole: boolean): bigint {
  return whole ? (value / FACTOR) * FACTOR : value;
}

// Oldest first. Same day: buys and sells, then events, then fraction sales (they need the event's fraction).
function rankOf(step: Step): number {
  if (step.fractionSale) {
    return 2;
  }

  return isInvestmentEvent(step.type) ? 1 : 0;
}

// The proportional cost of selling `sold` out of `held`; everything costs the whole position.
function removedCost(cost: number, sold: bigint, held: bigint): number {
  if (sold === held) {
    return cost;
  }

  return Number(roundDiv(BigInt(cost) * sold, held));
}

function replay(
  steps: Step[],
  assetClass: InvestmentAssetClass,
): { cost: number; quantity: bigint } {
  let quantity = ZERO;
  let cost = 0;

  for (const step of steps) {
    if (isInvestmentEvent(step.type)) {
      const applied =
        quantity > ZERO && step.event
          ? applyEvent(
              { ...step.event, date: step.date, type: step.type },
              quantity,
              cost,
              assetClass,
            )
          : null;

      if (applied) {
        quantity = applied.quantityAfter;
        cost = applied.costAfter;
      }
    } else if (step.fractionSale) {
      // The fraction already left with its event: the sale changes neither quantity nor cost.
      continue;
    } else if (step.type === InvestmentOperationType.BUY) {
      quantity += step.quantity;
      cost += step.total;
    } else if (step.quantity >= quantity) {
      cost = 0;
      quantity = ZERO;
    } else {
      cost -= removedCost(cost, step.quantity, quantity);
      quantity -= step.quantity;
    }
  }

  return { cost, quantity };
}

function toSteps(existing: InvestmentOperation[]): Step[] {
  return [...existing]
    .reverse()
    .map((operation) => ({
      date: operation.date,
      event: operation.corporateEvent,
      fractionSale: operation.fractionOfOperationId !== undefined,
      quantity: parseDecimal(operation.quantity) ?? ZERO,
      total: operation.total,
      type: operation.type,
    }))
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date < b.date ? -1 : 1;
      }

      return rankOf(a) - rankOf(b);
    });
}
