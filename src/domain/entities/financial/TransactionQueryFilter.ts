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
