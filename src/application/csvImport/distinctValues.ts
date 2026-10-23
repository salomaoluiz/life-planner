import { normalizeText } from "./suggestColumns";
import { RowType } from "./types";

// FR 28 / spec 048 FR 4: the names of the rows the app writes itself and the import leaves out. Card credits and invoice
// payments are imported now.
const SYSTEM_CATEGORY_NAMES = ["Balance adjustment", "Ajuste de saldo"].map(
  (name) => normalizeText(name),
);

interface Candidate {
  id: string;
  names: string[];
}

interface DistinctValue {
  // Number of rows using the value.
  rows: number;
  value: string;
}

const INCOME_WORDS = [
  "receita",
  "income",
  "credito",
  "credit",
  "c",
  "+",
  "entrada",
];
const EXPENSE_WORDS = [
  "despesa",
  "expense",
  "debito",
  "debit",
  "d",
  "-",
  "saida",
];
const PAID_WORDS = ["sim", "yes", "pago", "paid", "true", "1", "x", "s", "y"];
const UNPAID_WORDS = [
  "nao",
  "no",
  "false",
  "0",
  "nao pago",
  "unpaid",
  "pendente",
  "n",
];

// FR 24: equal ignoring case, accents and surrounding spaces; a category also matches its full path, whatever the
// separator (`>`, `/`, `:`).
function autoMatch(value: string, candidates: Candidate[]): string | undefined {
  const wanted = normalizeName(value);

  return candidates.find((candidate) =>
    candidate.names.some((name) => normalizeName(name) === wanted),
  )?.id;
}

// The non-empty trimmed values of a column with how many rows use each, in first-seen order (FR 22).
function distinctValues(rows: string[][], column: number): DistinctValue[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const value = (row[column] ?? "").trim();

    if (value !== "") {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([value, count]) => ({
    rows: count,
    value,
  }));
}

function isSystemCategoryName(value: string): boolean {
  return SYSTEM_CATEGORY_NAMES.includes(normalizeText(value));
}

// FR 24: yes/no words; an empty cell uses the default (FR 21).
function matchPaid(value: string): "default" | boolean | undefined {
  const word = normalizeText(value);

  if (word === "") {
    return "default";
  }

  if (PAID_WORDS.includes(word)) {
    return true;
  }

  return UNPAID_WORDS.includes(word) ? false : undefined;
}

// FR 24: the common words for income and expense, in both languages.
function matchType(value: string): RowType | undefined {
  const word = normalizeText(value) || value.trim();

  if (INCOME_WORDS.includes(word)) {
    return "INCOME";
  }

  return EXPENSE_WORDS.includes(word) ? "EXPENSE" : undefined;
}

function normalizeName(name: string): string {
  return normalizeText(name.replace(/\s*[>/:]\s*/g, " > "));
}

export type { Candidate, DistinctValue };
export {
  autoMatch,
  distinctValues,
  isSystemCategoryName,
  matchPaid,
  matchType,
};
