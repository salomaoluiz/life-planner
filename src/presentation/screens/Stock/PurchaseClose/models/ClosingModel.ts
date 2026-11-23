import { PurchaseRowEntity } from "@domain/entities/stock/PurchaseEntity";

export interface Breakdown {
  // receipt − priced items: the adjustment (all priced), what the single row receives, or the "Sem preço" part.
  differenceCents: number;
  mode: BreakdownMode;
  noPriceCount: number;
  pricedSumCents: number;
}

export type BreakdownMode =
  | "ALL_PRICED"
  | "SINGLE_FILLED"
  | "TOTAL_BELOW"
  | "UNKNOWN_PART"
  | "UNPRICED";

export interface RowEdit {
  priceCents?: number;
  unknown?: boolean;
  // kg/L rows are weighed at the checkout: the quantity typed at closing (FR 28).
  weight?: string;
}

// FR 28: how the receipt total closes against the rows (mirrors the server rule; the server decides).
export function breakdownOf(input: {
  edits: Record<string, RowEdit | undefined>;
  receiptTotalCents: number;
  rows: PurchaseRowEntity[];
}): Breakdown {
  const lines = input.rows.map((row) => ({
    line: lineTotalOf(row, input.edits[row.id]),
    unknown: input.edits[row.id]?.unknown === true,
  }));
  const pricedSumCents = lines.reduce((sum, row) => sum + (row.line ?? 0), 0);
  const missing = lines.filter((row) => row.line === undefined);
  const unmarked = missing.filter((row) => !row.unknown);
  const differenceCents = input.receiptTotalCents - pricedSumCents;

  if (missing.length === 0) {
    return {
      differenceCents,
      mode: "ALL_PRICED",
      noPriceCount: 0,
      pricedSumCents,
    };
  }

  if (missing.length === 1 && unmarked.length === 1) {
    return {
      differenceCents,
      mode: differenceCents > 0 ? "SINGLE_FILLED" : "TOTAL_BELOW",
      noPriceCount: 1,
      pricedSumCents,
    };
  }

  if (unmarked.length > 0) {
    return {
      differenceCents,
      mode: "UNPRICED",
      noPriceCount: unmarked.length,
      pricedSumCents,
    };
  }

  return {
    differenceCents,
    mode: differenceCents >= 0 ? "UNKNOWN_PART" : "TOTAL_BELOW",
    noPriceCount: missing.length,
    pricedSumCents,
  };
}

// FR 14: the unit price typed × the quantity (the weight at closing for kg/L rows), rounded half up.
export function lineTotalOf(
  row: PurchaseRowEntity,
  edit?: RowEdit,
): number | undefined {
  if (edit?.unknown) {
    return undefined;
  }

  if (edit?.priceCents !== undefined && edit.priceCents > 0) {
    const quantity = parseWeight(edit.weight) ?? row.quantity ?? 1;

    return Math.round(edit.priceCents * quantity);
  }

  return row.lineTotalCents;
}

export function parseWeight(text?: string): number | undefined {
  const value = Number((text ?? "").replace(",", "."));

  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export const CLOSE_STEPS = [
  "prices",
  "newItems",
  "expirations",
  "payment",
] as const;
export type CloseStep = (typeof CLOSE_STEPS)[number];

// The steps without anything to ask are skipped (FR 29, 31).
export function visibleSteps(input: {
  hasExpirations: boolean;
  hasNewItems: boolean;
}): CloseStep[] {
  return CLOSE_STEPS.filter((step) => {
    if (step === "newItems") {
      return input.hasNewItems;
    }

    return step === "expirations" ? input.hasExpirations : true;
  });
}
