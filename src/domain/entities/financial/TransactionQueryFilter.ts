// A period of the transactions list, `YYYY-MM-DD`, both inclusive. Account rows belong to it by their date and card
// purchases by the list date of their invoice (what the month on screen shows).
export interface TransactionDateRange {
  from: string;
  to: string;
}

// Spec 045: the filters of the transactions, invoices and projections lists, as the API takes them.
export interface TransactionQueryFilter {
  accountIds?: string[];
  categoryIds?: string[];
  creditCardIds?: string[];
  // `YYYY-MM-DD`, both inclusive and always together.
  from?: string;
  paid?: boolean;
  q?: string;
  tagIds?: string[];
  to?: string;
}

// Spec 078: the longest period the API accepts (2 years) ending on `today` (`YYYY-MM-DD`): what a search without a
// chosen period looks at.
export function lastTwoYearsRange(today: string): TransactionDateRange {
  const [year, month, day] = today.split("-").map(Number);
  const from = new Date(year - 2, month - 1, day + 1);
  const fromKey = [
    from.getFullYear(),
    String(from.getMonth() + 1).padStart(2, "0"),
    String(from.getDate()).padStart(2, "0"),
  ].join("-");

  return { from: fromKey, to: today };
}

// The first and last day of a `YYYY-MM` month (local calendar).
export function monthDateRange(monthKey: string): TransactionDateRange {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    from: `${monthKey}-01`,
    to: `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  };
}

// Spec 078: what a screen that needs "the transactions" without a period looks at (a row to edit, the transactions of a
// category): 24 whole months, from 20 months back to 3 months ahead of `today`. The API needs a period of 2 years at most.
export function recentTransactionsRange(today: Date): TransactionDateRange {
  const start = new Date(today.getFullYear(), today.getMonth() - 20, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  return {
    from: monthDateRange(toMonthKey(start)).from,
    to: monthDateRange(toMonthKey(end)).to,
  };
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
