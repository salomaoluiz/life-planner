import { BuiltRow } from "@application/csvImport/buildRows";
import { creditKeyOf } from "@application/csvImport/cardCredits";
import { ImportRowPayload } from "@application/csvImport/types";
import {
  ImportInvoiceEntity,
  ImportValidationEntity,
} from "@domain/entities/financial/TransactionCsv";

export type ReviewFilter = "ALL" | "DUPLICATES" | "ERRORS";

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

export {
  canImport,
  filterRows,
  importPayloads,
  invoiceLines,
  kindCounts,
  mergeValidation,
  revalidationRequest,
  reviewRows,
  summarize,
};
