import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  InvestmentFee,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import {
  formatDecimal,
  mulToCents,
  parseDecimal,
  roundDiv,
  ZERO,
} from "@utils/decimal";

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

interface Step {
  date: string;
  quantity: bigint;
  total: number;
  type: InvestmentOperationType;
}

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

// `existing` is the asset's operations as the API returns them (newest first), WITHOUT the one being edited.
export function previewOperation(
  existing: InvestmentOperation[],
  draft: OperationDraft,
): OperationPreview {
  const totals = computeTotals(
    draft.type,
    draft.quantity,
    draft.unitPrice,
    draft.fees,
  );
  const quantity = parseDecimal(draft.quantity) ?? ZERO;
  // Oldest first; operations of the same day keep the order they were entered, the draft goes last.
  const steps: Step[] = [...existing].reverse().map((operation) => ({
    date: operation.date,
    quantity: parseDecimal(operation.quantity) ?? ZERO,
    total: operation.total,
    type: operation.type,
  }));
  const before = replay(steps.filter((step) => step.date <= draft.date));

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

// The proportional cost of selling `sold` out of `held`; everything costs the whole position.
function removedCost(cost: number, sold: bigint, held: bigint): number {
  if (sold === held) {
    return cost;
  }

  return Number(roundDiv(BigInt(cost) * sold, held));
}

function replay(steps: Step[]): { cost: number; quantity: bigint } {
  let quantity = ZERO;
  let cost = 0;

  for (const step of steps) {
    if (step.type === InvestmentOperationType.BUY) {
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
