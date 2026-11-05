export interface UpcomingEntity {
  next: UpcomingItemEntity[];
  // How many items matched the next-days window before the cut.
  nextTotal: number;
  overdue: UpcomingItemEntity[];
  overdueTotals: { expenseCents: number; incomeCents: number };
}

export interface UpcomingItemEntity {
  accountId: null | string;
  categoryId: null | string;
  creditCardId: null | string;
  currency: string;
  date: string;
  description: string;
  // A transaction id, `<cardId>:<YYYY-MM>` for an invoice or `<recurrenceId>:<occurrence>` for a projection.
  id: string;
  invoiceMonth: null | string;
  kind: UpcomingKind;
  occurrenceNumber: null | number;
  owner: string;
  ownerId: string;
  // Spec 096: the projected part of an invoice item (cents); absent when there is none.
  projectedAmount?: number;
  purchaseCount: null | number;
  recurrenceId: null | string;
  type: "EXPENSE" | "INCOME";
  valueCents: number;
}

// What is still to pay or receive (spec 062): overdue items and the next days' items. Money in cents, dates `YYYY-MM-DD`.
export type UpcomingKind = "INVOICE" | "PROJECTION" | "TRANSACTION";
