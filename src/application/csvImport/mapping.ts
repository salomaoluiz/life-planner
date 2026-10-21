import { ColumnMapping, ColumnTarget, FixedValues } from "./types";

const AMOUNT_TARGETS: ColumnTarget[] = [
  "amount",
  "expenseAmount",
  "incomeAmount",
  "signedAmount",
];

type FieldName =
  | "accountOrCard"
  | "amountAndType"
  | "category"
  | "date"
  | "description";

interface FieldStatus {
  field: FieldName;
  // Rows the mapping leaves without a value for the field (0 when ok).
  missingRows: number;
  ok: boolean;
  // What covers it: a column, a fixed value for every row, or nothing.
  source: "column" | "fixed" | "none";
}

function amountStatus(mapping: ColumnMapping, fixed: FixedValues): FieldStatus {
  function has(target: ColumnTarget): boolean {
    return columnsOf(mapping, target).length > 0;
  }
  const columns =
    has("signedAmount") ||
    (has("incomeAmount") && has("expenseAmount")) ||
    (has("amount") && has("type"));
  const fixedType = has("amount") && fixed.type !== undefined;

  if (columns) {
    return {
      field: "amountAndType",
      missingRows: 0,
      ok: true,
      source: "column",
    };
  }

  return {
    field: "amountAndType",
    missingRows: 0,
    ok: fixedType,
    source: fixedType ? "fixed" : "none",
  };
}

// FR 15 and 16: a target is on one column only (choosing it again moves it); the three ways to give the amount
// and the type exclude each other, and picking one clears the targets of the others.
function applyTarget(
  mapping: ColumnMapping,
  column: number,
  target: ColumnTarget,
): ColumnMapping {
  const next: ColumnMapping = { ...mapping };

  if (target !== "ignore") {
    for (const [other, current] of Object.entries(next)) {
      if (current === target && Number(other) !== column) {
        next[Number(other)] = "ignore";
      }
    }
  }

  if (AMOUNT_TARGETS.includes(target)) {
    const keep = keptWithAmount(target);

    for (const [other, current] of Object.entries(next)) {
      if (
        Number(other) !== column &&
        AMOUNT_TARGETS.includes(current) &&
        !keep.includes(current)
      ) {
        next[Number(other)] = "ignore";
      }
    }
  }

  next[column] = target;

  return next;
}

function canContinue(statuses: FieldStatus[]): boolean {
  return statuses.every((status) => status.ok);
}

// The columns mapped to a target.
function columnsOf(mapping: ColumnMapping, target: ColumnTarget): number[] {
  return Object.entries(mapping)
    .filter(([, current]) => current === target)
    .map(([column]) => Number(column));
}

function columnStatus(
  field: FieldName,
  mapping: ColumnMapping,
  target: ColumnTarget,
): FieldStatus {
  const ok = columnsOf(mapping, target).length > 0;

  return { field, missingRows: 0, ok, source: ok ? "column" : "none" };
}

// FR 17-20: Date, Description, Amount and type, Category and Account or card, each covered by a column or a fixed value.
function fieldStatuses(
  mapping: ColumnMapping,
  fixed: FixedValues,
  rows: string[][],
): FieldStatus[] {
  return [
    columnStatus("date", mapping, "date"),
    columnStatus("description", mapping, "description"),
    amountStatus(mapping, fixed),
    valueStatus("category", mapping, ["category"], fixed.categoryId, rows),
    valueStatus(
      "accountOrCard",
      mapping,
      ["account", "card"],
      fixed.accountOrCard?.id,
      rows,
    ),
  ];
}

// The income and expense columns go together; every other way of giving the amount stands alone.
function keptWithAmount(target: ColumnTarget): ColumnTarget[] {
  return target === "incomeAmount" || target === "expenseAmount"
    ? ["incomeAmount", "expenseAmount"]
    : [target];
}

// Spec 048 FR 3: rows with both a card and an account are payments from that account.
function rowsWithCardAndAccount(
  rows: string[][],
  mapping: ColumnMapping,
): number {
  const accounts = columnsOf(mapping, "account");
  const cards = columnsOf(mapping, "card");

  function filled(row: string[], columns: number[]) {
    return columns.some((column) => (row[column] ?? "").trim() !== "");
  }

  return rows.filter((row) => filled(row, accounts) && filled(row, cards))
    .length;
}

// A column covers the field for the rows where it has a value; a fixed value covers the rest (FR 18, 19).
function valueStatus(
  field: FieldName,
  mapping: ColumnMapping,
  targets: ColumnTarget[],
  fixedId: string | undefined,
  rows: string[][],
): FieldStatus {
  const columns = targets.flatMap((target) => columnsOf(mapping, target));

  if (fixedId !== undefined) {
    return {
      field,
      missingRows: 0,
      ok: true,
      source: columns.length > 0 ? "column" : "fixed",
    };
  }

  const missingRows =
    columns.length === 0
      ? rows.length
      : rows.filter((row) =>
          columns.every((column) => (row[column] ?? "").trim() === ""),
        ).length;

  return {
    field,
    missingRows,
    ok: missingRows === 0,
    source: columns.length > 0 ? "column" : "none",
  };
}

export type { FieldName, FieldStatus };
export {
  applyTarget,
  canContinue,
  columnsOf,
  fieldStatuses,
  rowsWithCardAndAccount,
};
