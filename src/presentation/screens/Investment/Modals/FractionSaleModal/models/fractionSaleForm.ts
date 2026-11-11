import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { InvestmentFeeKind } from "@domain/entities/investment/enums";
import { InvestmentFeeParams } from "@domain/repositories/investment";

// Spec 108 FR 15: a fraction sale is small, so its fees are the plain kinds (no "Other", which needs a description).
export const FRACTION_FEE_KINDS = [
  InvestmentFeeKind.BROKERAGE,
  InvestmentFeeKind.EXCHANGE_FEES,
];

export interface FractionFee {
  amountCents: number;
  key: string;
  kind: InvestmentFeeKind;
}

export interface FractionSaleErrors {
  account: boolean;
  date: "before" | "future" | undefined;
  fees: boolean;
  gross: boolean;
}

interface FractionSaleDraft {
  accountId: string;
  // The data-com of the event: the sale cannot be dated before it.
  eventDate: string;
  fees: FractionFee[];
  // Cents of the auction amount; 0 with `writeOff`.
  gross: number;
  // `YYYY-MM-DD`
  saleDate: string;
  today: string;
  writeOff: boolean;
}

export function feesTotal(fees: FractionFee[]): number {
  return fees.reduce((sum, fee) => sum + fee.amountCents, 0);
}

// What the owner realizes: the auction amount minus fees minus the cost that left with the fraction (FR 17).
export function realizedResult(
  gross: number,
  fees: FractionFee[],
  fractionCost: number,
): number {
  return gross - feesTotal(fees) - fractionCost;
}

let counter = 0;

export function hasErrors(errors: FractionSaleErrors): boolean {
  return (
    errors.account || errors.date !== undefined || errors.fees || errors.gross
  );
}

export function newFee(): FractionFee {
  counter += 1;

  return {
    amountCents: 0,
    key: `fee-${counter}`,
    kind: InvestmentFeeKind.BROKERAGE,
  };
}

export function toDay(date: Date): string {
  return todayCalendarDate(date);
}

export function toFeeParams(fees: FractionFee[]): InvestmentFeeParams[] {
  return fees
    .filter((fee) => fee.amountCents > 0)
    .map((fee) => ({
      amount: fee.amountCents,
      description: undefined,
      kind: fee.kind,
    }));
}

export function validateSale(draft: FractionSaleDraft): FractionSaleErrors {
  const missingAmount = !draft.writeOff && draft.gross <= 0;
  let date: FractionSaleErrors["date"];

  if (draft.saleDate < draft.eventDate) {
    date = "before";
  } else if (draft.saleDate > draft.today) {
    date = "future";
  }

  return {
    account: !draft.writeOff && !draft.accountId,
    date,
    fees: !draft.writeOff && feesTotal(draft.fees) > draft.gross,
    gross: missingAmount,
  };
}
