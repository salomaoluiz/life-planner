// Spec 127: the activity history of Finance and Investments. Same enum values as the API.
type ActivityAction = "CREATE" | "DELETE" | "UPDATE";
// The list filter also takes BATCH (entries done in bulk); it is not an action of an entry.
type ActivityActionFilter = "BATCH" | ActivityAction;
type ActivityModule = "FINANCE" | "INVESTMENT";
type ActivityOwnerType = "FAMILY" | "USER";

const ACTIVITY_ENTITY_TYPES = [
  "ACCOUNT",
  "ASSET",
  "BALANCE_ADJUSTMENT",
  "CARD_EARLY_PAYMENT",
  "CARD_REFUND",
  "CATEGORY",
  "CONVERSION",
  "CORPORATE_EVENT",
  "CREDIT_CARD",
  "FIXED_INCOME_TERMS",
  "INCOME",
  "INCOME_SERIES",
  "INSTALLMENT_PLAN",
  "INSTALLMENT_PREPAYMENT",
  "INVOICE_PAYMENT",
  "OPERATION",
  "RECURRENCE",
  "SPLIT",
  "STOCK_PURCHASE_POSTING",
  "TAG",
  "TRANSACTION",
  "TRANSACTION_IMPORT",
  "TRANSFER",
  "VALUATION",
] as const;

interface ActivityBatchFilters {
  cursor?: string;
  id: string;
  q?: string;
}

interface ActivityBatchHeaderEntity {
  bookingFrom: null | string;
  bookingTo: null | string;
  count: number;
  existing: number;
  sources: string[];
  totals: { amountCents: number; currency: string }[];
}

interface ActivityBatchItemEntity {
  action: ActivityAction;
  amountCents: null | number;
  bookingDate: null | string;
  currency: null | string;
  entityId: string;
  entityType: ActivityEntityType;
  itemExists: boolean;
  label: string;
  sourceName: null | string;
}

interface ActivityBatchPageEntity {
  header: ActivityBatchHeaderEntity | null;
  items: ActivityBatchItemEntity[];
  nextCursor: null | string;
}

interface ActivityChangeEntity {
  field: string;
  from: unknown;
  to: unknown;
}

type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

interface ActivityEntryEntity {
  action: ActivityAction;
  actor: { id: null | string; name: string };
  batch: boolean;
  batchPreview: null | { count: number; labels: string[] };
  changes: ActivityChangeEntity[] | null;
  entityId: null | string;
  entityType: ActivityEntityType;
  id: string;
  itemExists: boolean;
  modules: ActivityModule[];
  occurredAt: string;
  owner: { id: string; name: string; type: ActivityOwnerType };
  summary: ActivitySummaryEntity;
}

interface ActivityFilters {
  action?: ActivityActionFilter;
  actorId?: string;
  cursor?: string;
  // ISO instants of the action time (the user's day boundaries).
  from?: string;
  module: ActivityModule;
  ownerId?: string;
  q?: string;
  to?: string;
}

interface ActivityPageEntity {
  items: ActivityEntryEntity[];
  nextCursor: null | string;
}

interface ActivitySummaryEntity {
  amountCents?: number;
  bookingDate?: string;
  currency?: string;
  extra?: Record<string, unknown>;
  label: string;
  sources?: string[];
}

export { ACTIVITY_ENTITY_TYPES };
export type {
  ActivityAction,
  ActivityActionFilter,
  ActivityBatchFilters,
  ActivityBatchHeaderEntity,
  ActivityBatchItemEntity,
  ActivityBatchPageEntity,
  ActivityChangeEntity,
  ActivityEntityType,
  ActivityEntryEntity,
  ActivityFilters,
  ActivityModule,
  ActivityOwnerType,
  ActivityPageEntity,
  ActivitySummaryEntity,
};
