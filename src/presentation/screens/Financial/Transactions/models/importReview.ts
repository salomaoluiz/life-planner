import { BuiltRow } from "@application/csvImport/buildRows";
import { creditKeyOf } from "@application/csvImport/cardCredits";
import { ImportRowPayload } from "@application/csvImport/types";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";
import {
  ImportInvoiceEntity,
  ImportValidationEntity,
} from "@domain/entities/financial/TransactionCsv";

export interface CurrencyTotal {
  cents: number;
  currency: CurrencyCode;
}

export interface ReviewBlock {
  block: ReviewBlockKey;
  expenses: CurrencyTotal[];
  groups: ReviewGroup[];
  income: CurrencyTotal[];
  selected: number;
  total: number;
}

export type ReviewBlockKey = "account" | "card";

export type ReviewFilter = "ALL" | "DUPLICATES" | "ERRORS";

export interface ReviewGroup {
  expenses: CurrencyTotal[];
  income: CurrencyTotal[];
  key: string;
  name?: string;
  nameKey?: ReviewGroupNameKey;
  rows: ReviewRow[];
  selected: number;
  total: number;
  unchecked: number;
}

export type ReviewGroupNameKey =
  | "financial.import.review.boleto"
  | "financial.import.review.groups.noAccount"
  | "financial.import.review.groups.noCard"
  | "financial.import.review.groups.noRecord";

export interface ReviewRecords {
  accounts: { currency: CurrencyCode; id: string; name: string }[];
  cards: { currency: CurrencyCode; id: string; name: string }[];
}

export interface ReviewRow {
  checked: boolean;
  // The cells of the file, shown whatever the outcome.
  display: BuiltRow["display"];
  // FR 29: looks like a transaction the owner already has (or an earlier row of the file).
  duplicate: boolean;
  // Local (`INVALID_DATE`…) or from the API (`CURRENCY_MISMATCH`…).
  errorCode?: string;
  // The API's own message, when it sent one.
  errorMessage?: string;
  // Spec 048: the months and amounts the API's message needs.
  errorParams?: Record<string, number | string>;
  line: number;
  // FR 31: a row with an error is always checked and cannot be unchecked.
  locked: boolean;
  payload?: ImportRowPayload;
}

export interface ReviewSummary {
  duplicates: number;
  errors: number;
  // Checked rows without an error: what "Import N transactions" writes.
  ready: number;
}

// FR 31: any error blocks the whole import; nothing checked means nothing to import.
function canImport(summary: ReviewSummary): boolean {
  return summary.errors === 0 && summary.ready > 0;
}

function filterRows(rows: ReviewRow[], filter: ReviewFilter): ReviewRow[] {
  if (filter === "ERRORS") {
    return rows.filter((row) => row.errorCode);
  }

  return filter === "DUPLICATES" ? rows.filter((row) => row.duplicate) : rows;
}

// The rows `POST /transactions/import` receives: the checked ones without an error.
function importPayloads(rows: ReviewRow[]): ImportRowPayload[] {
  return rows.flatMap((row) =>
    row.checked && !row.errorCode && row.payload ? [row.payload] : [],
  );
}

// The invoices the file touches, as the summary lists them (`MM/YY`).
function invoiceLines(
  invoices: ImportInvoiceEntity[],
  cardName: (creditCardId: string) => string,
) {
  return invoices.map((invoice) => ({
    card: cardName(invoice.creditCardId),
    cents: invoice.amountDue,
    id: `${invoice.creditCardId}.${invoice.invoiceMonth}`,
    month: `${invoice.invoiceMonth.slice(5)}/${invoice.invoiceMonth.slice(2, 4)}`,
    paid: invoice.paid,
  }));
}

// Spec 048 FR 24: the card credits and the invoice payments that will be imported.
function kindCounts(rows: ReviewRow[]): { credits: number; payments: number } {
  const counts = { credits: 0, payments: 0 };

  for (const row of rows) {
    const key =
      row.checked && !row.errorCode && row.payload
        ? creditKeyOf(row.payload.categoryId)
        : undefined;

    if (key === "INVOICE_PAYMENT") {
      counts.payments += 1;
    } else if (key) {
      counts.credits += 1;
    }
  }

  return counts;
}

// The duplicates are found once, on the full file; a later check only sees the checked rows, so it keeps them.
function mergeValidation(
  knownDuplicates: number[],
  latest: ImportValidationEntity,
): ImportValidationEntity {
  return {
    ...latest,
    duplicates: [...new Set([...knownDuplicates, ...latest.duplicates])].sort(
      (a, b) => a - b,
    ),
  };
}

// Spec 048: what a new dry run sends after the user checks or unchecks rows: only the checked ones, and which of
// them are duplicates the user wants anyway (the API counts those in the invoice math).
function revalidationRequest(rows: ReviewRow[]): {
  includeDuplicates: number[];
  rows: ImportRowPayload[];
} {
  const checked = rows.filter((row) => row.checked && row.payload);

  return {
    includeDuplicates: checked
      .filter((row) => row.duplicate)
      .map((row) => row.line),
    rows: checked.flatMap((row) => (row.payload ? [row.payload] : [])),
  };
}

// Spec 049 FR 2: the row kind after step 3 decides the block, never the raw column alone.
function reviewBlockOf(row: ReviewRow): ReviewBlockKey {
  const payload = row.payload;
  const credit = payload ? creditKeyOf(payload.categoryId) : undefined;

  if (credit === "INVOICE_PAYMENT") {
    return "account";
  }

  if (credit) {
    return "card";
  }

  return payload?.creditCardId ? "card" : "account";
}

// FR 27-31: the built rows with the dry-run answer and the user's check marks. A duplicate comes unchecked unless the
// user checked it; an error row is locked on.
function reviewRows(
  built: BuiltRow[],
  validation: Pick<ImportValidationEntity, "duplicates" | "errors"> | undefined,
  selection: Record<number, boolean>,
): ReviewRow[] {
  const serverErrors = new Map(
    (validation?.errors ?? []).map((error) => [error.line, error]),
  );
  const duplicates = new Set(validation?.duplicates ?? []);

  return built.map((row) => {
    const server = serverErrors.get(row.line);
    const errorCode = row.error ?? server?.code;
    const duplicate = !errorCode && duplicates.has(row.line);

    return {
      checked: errorCode ? true : (selection[row.line] ?? !duplicate),
      display: row.display,
      duplicate,
      errorCode,
      errorMessage: row.error ? undefined : server?.message,
      errorParams: row.error ? undefined : server?.params,
      line: row.line,
      locked: !!errorCode,
      payload: row.payload,
    };
  });
}

function summarize(rows: ReviewRow[]): ReviewSummary {
  return {
    duplicates: rows.filter((row) => row.duplicate).length,
    errors: rows.filter((row) => row.errorCode).length,
    ready: rows.filter((row) => row.checked && !row.errorCode).length,
  };
}

const NO_RECORD_KEY = "none";
const BOLETO_KEY = "boleto";
const MISSING_ACCOUNT_KEY = "missing-account";
const MISSING_CARD_KEY = "missing-card";

function accountKeyOf(id?: string, records?: ReviewRecords): string {
  if (!id) {
    return NO_RECORD_KEY;
  }

  return records?.accounts.some((item) => item.id === id)
    ? `account:${id}`
    : MISSING_ACCOUNT_KEY;
}

function currencyOrder(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a === DEFAULT_CURRENCY) {
    return -1;
  }

  return b === DEFAULT_CURRENCY ? 1 : a.localeCompare(b);
}

function currencyTotals(
  rows: ReviewRow[],
  records: ReviewRecords,
): Record<string, { expenses: number; income: number }> {
  const totals: Record<string, { expenses: number; income: number }> = {};

  for (const row of rows) {
    const payload = row.payload;

    if (!payload) {
      continue;
    }

    const currency = rowCurrency(row, records);
    const entry = totals[currency] ?? { expenses: 0, income: 0 };

    entry[payload.type === "INCOME" ? "income" : "expenses"] += Math.abs(
      payload.value,
    );
    totals[currency] = entry;
  }

  return totals;
}

// Spec 049 FR 3-4: the record the block groups by, with sentinels for the rows without one.
function groupKeyOf(row: ReviewRow, records: ReviewRecords): string {
  const payload = row.payload;

  if (reviewBlockOf(row) === "account") {
    if (!payload) {
      return NO_RECORD_KEY;
    }

    if (creditKeyOf(payload.categoryId) !== "INVOICE_PAYMENT") {
      return accountKeyOf(payload.accountId, records);
    }

    return payload.paidFromAccountId
      ? accountKeyOf(payload.paidFromAccountId, records)
      : BOLETO_KEY;
  }

  const id = payload?.creditCardId;

  if (!id) {
    return NO_RECORD_KEY;
  }

  return records.cards.some((item) => item.id === id)
    ? `card:${id}`
    : MISSING_CARD_KEY;
}

function nameOf(
  key: string,
  records: ReviewRecords,
): Pick<ReviewGroup, "name" | "nameKey"> {
  if (key.startsWith("account:")) {
    return {
      name: records.accounts.find((item) => `account:${item.id}` === key)?.name,
    };
  }

  if (key.startsWith("card:")) {
    return {
      name: records.cards.find((item) => `card:${item.id}` === key)?.name,
    };
  }

  if (key === BOLETO_KEY) {
    return { nameKey: "financial.import.review.boleto" };
  }

  if (key === MISSING_ACCOUNT_KEY) {
    return { nameKey: "financial.import.review.groups.noAccount" };
  }

  return {
    nameKey:
      key === MISSING_CARD_KEY
        ? "financial.import.review.groups.noCard"
        : "financial.import.review.groups.noRecord",
  };
}

// FR 4: records by name, then the ones without a resolved record (not found, boleto, none).
function rankOf(key: string): number {
  if (key.startsWith("missing")) {
    return 1;
  }

  if (key === BOLETO_KEY) {
    return 2;
  }

  return key === NO_RECORD_KEY ? 3 : 0;
}

// FR 1-9: both blocks, their groups by record, and the subtotals of the rows that will be imported.
function reviewGroups(
  rows: ReviewRow[],
  records: ReviewRecords,
): ReviewBlock[] {
  const byBlock: Record<ReviewBlockKey, Map<string, ReviewGroup>> = {
    account: new Map(),
    card: new Map(),
  };

  for (const row of rows) {
    const block = reviewBlockOf(row);
    const key = groupKeyOf(row, records);
    const group = byBlock[block].get(key);

    if (group) {
      group.rows.push(row);
      group.selected += row.checked ? 1 : 0;
      group.total += 1;
    } else {
      byBlock[block].set(key, {
        ...nameOf(key, records),
        expenses: [],
        income: [],
        key,
        rows: [row],
        selected: row.checked ? 1 : 0,
        total: 1,
        unchecked: 0,
      });
    }
  }

  return (["account", "card"] as ReviewBlockKey[]).map((block) => {
    const groups = [...byBlock[block].values()]
      .map((group) => ({
        ...group,
        ...totalsOf(group.rows, records),
        unchecked: group.total - group.selected,
      }))
      .sort((a, b) => {
        const rank = rankOf(a.key) - rankOf(b.key);

        if (rank !== 0) {
          return rank;
        }

        return (a.name ?? "").localeCompare(b.name ?? "", undefined, {
          sensitivity: "base",
        });
      });

    return {
      ...totalsOf(
        groups.flatMap((group) => group.rows),
        records,
      ),
      block,
      groups,
      selected: groups.reduce((sum, group) => sum + group.selected, 0),
      total: groups.reduce((sum, group) => sum + group.total, 0),
    };
  });
}

// FR 9: the row's own currency; a 047 row without one takes its card's or account's currency.
function rowCurrency(row: ReviewRow, records: ReviewRecords): CurrencyCode {
  const payload = row.payload;
  const card = payload?.creditCardId
    ? records.cards.find((item) => item.id === payload.creditCardId)
    : undefined;
  const accountId = payload?.accountId ?? payload?.paidFromAccountId;
  const account = accountId
    ? records.accounts.find((item) => item.id === accountId)
    : undefined;

  if (payload?.currency) {
    return toCurrencyCode(payload.currency);
  }

  return card?.currency ?? account?.currency ?? DEFAULT_CURRENCY;
}

// FR 19-21: the checked lines of a snapshot, sorted; comparing two keys tells whether it is stale.
function selectionKey(rows: ReviewRow[]): string {
  return rows
    .filter((row) => row.checked)
    .map((row) => row.line)
    .sort((a, b) => a - b)
    .join(",");
}

// FR 7-8: only checked, error-free rows; cents as integers, per currency, never converted.
function totalsOf(
  rows: ReviewRow[],
  records: ReviewRecords,
): Pick<ReviewGroup, "expenses" | "income"> {
  const totals = currencyTotals(
    rows.filter((row) => row.checked && !row.errorCode),
    records,
  );
  const currencies = Object.keys(totals).sort(currencyOrder);

  return {
    expenses: currencies.flatMap((currency) =>
      totals[currency].expenses > 0
        ? [
            {
              cents: totals[currency].expenses,
              currency: currency as CurrencyCode,
            },
          ]
        : [],
    ),
    income: currencies.flatMap((currency) =>
      totals[currency].income > 0
        ? [
            {
              cents: totals[currency].income,
              currency: currency as CurrencyCode,
            },
          ]
        : [],
    ),
  };
}

export {
  canImport,
  currencyTotals,
  filterRows,
  groupKeyOf,
  importPayloads,
  invoiceLines,
  kindCounts,
  mergeValidation,
  revalidationRequest,
  reviewBlockOf,
  reviewGroups,
  reviewRows,
  selectionKey,
  summarize,
};
