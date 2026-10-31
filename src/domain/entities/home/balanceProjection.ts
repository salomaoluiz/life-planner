import { DailyBalanceDayEntity } from "@domain/entities/financial/DailyBalanceEntity";

// Pure rules of the home finance balance (spec 062). Money in integer cents, dates `YYYY-MM-DD`.

export interface BalanceBreakdown {
  currentCents: number;
  toPayCents: number;
  toReceiveCents: number;
}

export interface LowestBalanceDay {
  accounts: DailyBalanceDayEntity["accounts"];
  date: string;
  totalCents: number;
}

// Current balance + to receive − to pay must equal the projected end-of-month balance. When the sources
// disagree the current balance and the income to receive stay and the expense to pay is derived; if that
// would be negative, the income to receive is derived instead.
export function deriveBreakdown(
  input: BalanceBreakdown & { projectedEndCents: number },
): BalanceBreakdown {
  const { currentCents, projectedEndCents, toPayCents, toReceiveCents } = input;

  if (currentCents + toReceiveCents - toPayCents === projectedEndCents) {
    return { currentCents, toPayCents, toReceiveCents };
  }

  const derivedToPay = currentCents + toReceiveCents - projectedEndCents;

  if (derivedToPay >= 0) {
    return { currentCents, toPayCents: derivedToPay, toReceiveCents };
  }

  return {
    currentCents,
    toPayCents: 0,
    toReceiveCents: projectedEndCents - currentCents,
  };
}

// The lowest end-of-day total from `fromDate` on; on a tie the earliest day wins.
export function lowestBalanceDay(
  days: DailyBalanceDayEntity[],
  fromDate: string,
): LowestBalanceDay | undefined {
  let lowest: DailyBalanceDayEntity | undefined;

  for (const day of days) {
    if (day.date < fromDate) {
      continue;
    }
    if (
      !lowest ||
      day.totalCents < lowest.totalCents ||
      (day.totalCents === lowest.totalCents && day.date < lowest.date)
    ) {
      lowest = day;
    }
  }

  return lowest
    ? {
        accounts: lowest.accounts,
        date: lowest.date,
        totalCents: lowest.totalCents,
      }
    : undefined;
}

// The end-of-day total of the last day of the month.
export function projectedEndOfMonth(
  days: DailyBalanceDayEntity[],
): number | undefined {
  if (days.length === 0) {
    return undefined;
  }

  return days.reduce((last, day) => (day.date > last.date ? day : last))
    .totalCents;
}
