import { BuiltRow } from "@application/csvImport/buildRows";
import { ImportRowPayload } from "@application/csvImport/types";
import { ImportValidationEntity } from "@domain/entities/financial/TransactionCsv";

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

// FR 27-31: the built rows with the dry-run answer and the user's check marks. A duplicate comes unchecked unless the
// user checked it; an error row is locked on.
function reviewRows(
  built: BuiltRow[],
  validation: ImportValidationEntity | undefined,
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

export { canImport, filterRows, importPayloads, reviewRows, summarize };
