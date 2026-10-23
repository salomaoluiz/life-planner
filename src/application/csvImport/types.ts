type ColumnMapping = Record<number, ColumnTarget>;

// Spec 047: what a CSV column represents (FR 13).
type ColumnTarget =
  | "account"
  | "amount"
  | "card"
  | "category"
  | "currency"
  | "date"
  | "description"
  | "expenseAmount"
  | "ignore"
  | "incomeAmount"
  | "invoice"
  | "owner"
  | "paid"
  | "signedAmount"
  | "tags"
  | "type";

type CsvSeparator = "," | ";" | "\t";

type DateFormat = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";

type DecimalSeparator = "," | ".";

// FR 18-19: one value used by every row (or by the rows the column leaves empty).
interface FixedValues {
  accountOrCard?: { id: string; kind: "account" | "card" };
  categoryId?: string;
  type?: RowType;
}

// The body of one row of `POST /transactions/import`.
interface ImportRowPayload {
  accountId?: string;
  categoryId: string;
  creditCardId?: string;
  currency?: string;
  date: string;
  description: string;
  // Spec 048: `YYYY-MM`, card rows only.
  invoiceMonth?: string;
  line: number;
  // The row's owner (spec 047); the request's owner applies when absent.
  owner?: "FAMILY" | "USER";
  ownerId?: string;
  paid?: boolean;
  // Spec 048: the account an early payment or an invoice payment is paid from.
  paidFromAccountId?: string;
  tags?: string[];
  type: RowType;
  value: number;
}

type RowType = "EXPENSE" | "INCOME";

// FR 23-24: the app record (or fixed answer) chosen for each distinct value of a column.
// Accounts, cards and categories are matched per owner: their keys are `<ownerId>|<value>` and, for categories,
// `<ownerId>|<type>|<value>` (a family and Personal can have an account of the same name, income and expense a category).
interface ValueMaps {
  account: Record<string, string>;
  card: Record<string, string>;
  category: Record<string, string>;
  // File value of the "Belongs to" column → owner id.
  owner: Record<string, string>;
  paid: Record<string, "default" | boolean>;
  type: Record<string, RowType>;
}

export type {
  ColumnMapping,
  ColumnTarget,
  CsvSeparator,
  DateFormat,
  DecimalSeparator,
  FixedValues,
  ImportRowPayload,
  RowType,
  ValueMaps,
};
