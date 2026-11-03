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

// The first and last day of a `YYYY-MM` month (local calendar).
export function monthDateRange(monthKey: string): TransactionDateRange {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    from: `${monthKey}-01`,
    to: `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  };
}
