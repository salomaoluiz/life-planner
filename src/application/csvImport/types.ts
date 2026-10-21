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
  line: number;
  paid?: boolean;
  tags?: string[];
  type: RowType;
  value: number;
}

type RowType = "EXPENSE" | "INCOME";

// FR 23-24: the app record (or fixed answer) chosen for each distinct value of a column.
interface ValueMaps {
  account: Record<string, string>;
  card: Record<string, string>;
  category: Record<string, string>;
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
