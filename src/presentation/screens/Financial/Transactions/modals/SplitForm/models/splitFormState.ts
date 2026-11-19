import SplitEntity, {
  SplitResultEntity,
} from "@domain/entities/financial/SplitEntity";
import {
  CreateSplitRepositoryParams,
  SplitPartRepositoryParams,
  UpdateSplitRepositoryParams,
} from "@domain/repositories/financial";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  centsToDecimalString,
  decimalStringToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";

const MAX_DESCRIPTION = 200;
const MAX_NOTES = 1000;
// Spec 119 FR 6: a split has 2 to 50 parts.
const MIN_PARTS = 2;
const MAX_PARTS = 50;
const ADJUSTMENT_KEY = "SPLIT_ADJUSTMENT";

// What the form reads from a stored row (a transaction entity or its list DTO).
interface PartRow {
  accountId?: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  descriptionInherited: boolean;
  id: string;
  invoiceMonth?: string;
  notes?: string;
  paid: boolean;
  splitPosition?: number;
  systemKey?: string;
  tags: { name: string }[];
  type: string;
  value: string;
}

type PartType = "EXPENSE" | "INCOME";

type SplitFormErrors = Partial<
  Record<"date" | "description" | "parts" | "source" | "total", TranslationKeys>
> & {
  // Per part, by key.
  partCategory?: Record<string, TranslationKeys>;
  parts?: TranslationKeys;
  partValue?: Record<string, TranslationKeys>;
};

interface SplitFormState {
  accountId?: string;
  creditCardId?: string;
  date: Date;
  description: string;
  invoiceMonth?: string;
  notes: string;
  paid: boolean;
  parts: SplitPartDraft[];
  // The receipt total typed by the user; 0 = empty (the total is the sum of the parts).
  totalPaidCents: number;
}

// A part of the form. For the "Desconto/ajuste" part `cents` is signed (negative = discount, positive = extra
// charge); for every other part it is the amount, above zero.
interface SplitPartDraft {
  adjustment: boolean;
  categoryId?: string;
  cents: number;
  description: string;
  // Set on a part that is already stored (the PATCH keeps it in place).
  id?: string;
  key: string;
  tags: string[];
  type: PartType;
}

let keyCounter = 0;

// "Lançar em Desconto/ajuste": creates or updates the single adjustment part with the signed difference.
function applyToAdjustment(state: SplitFormState): SplitFormState {
  const delta = neededOutflowDelta(state);

  if (delta === 0) {
    return state;
  }
  const existing = state.parts.find((part) => part.adjustment);

  if (existing) {
    const cents = existing.cents + delta;

    return {
      ...state,
      parts:
        cents === 0
          ? state.parts.filter((part) => part !== existing)
          : state.parts.map((part) =>
              part === existing ? { ...part, cents } : part,
            ),
    };
  }

  return {
    ...state,
    parts: [
      ...state.parts,
      newPart("EXPENSE", { adjustment: true, cents: delta }),
    ],
  };
}

// "Tirar de uma parte" / "Pôr numa parte": the difference goes into the value of the chosen part.
function applyToPart(state: SplitFormState, key: string): SplitFormState {
  const delta = neededOutflowDelta(state);

  return {
    ...state,
    parts: state.parts.map((part) =>
      part.key === key
        ? {
            ...part,
            cents:
              part.type === "INCOME" ? part.cents - delta : part.cents + delta,
          }
        : part,
    ),
  };
}

function createInitialState(
  now: Date,
  overrides: Partial<SplitFormState> = {},
): SplitFormState {
  return {
    date: now,
    description: "",
    notes: "",
    paid: true,
    parts: [newPart(), newPart()],
    totalPaidCents: 0,
    ...overrides,
  };
}

function isSameState(a: SplitFormState, b: SplitFormState): boolean {
  return JSON.stringify(serializable(a)) === JSON.stringify(serializable(b));
}

function isValid(errors: SplitFormErrors): boolean {
  return Object.values(errors).every(
    (value) =>
      value === undefined ||
      (typeof value === "object" && Object.keys(value).length === 0),
  );
}

// The change of the net outflow that makes the parts match the typed total.
function neededOutflowDelta(state: SplitFormState): number {
  const diff = remainingCents(state);

  return netOutflowCents(state.parts) < 0 ? -diff : diff;
}

// Net outflow of the parts: positive = a net expense, negative = a net income (spec 119 FR 13).
function netOutflowCents(parts: SplitPartDraft[]): number {
  return parts.reduce((sum, part) => sum + outflowCents(part), 0);
}

function netType(parts: SplitPartDraft[]): PartType {
  return netOutflowCents(parts) < 0 ? "INCOME" : "EXPENSE";
}

function newKey() {
  keyCounter += 1;

  return `part-${keyCounter}`;
}

function newPart(
  type: PartType = "EXPENSE",
  overrides: Partial<SplitPartDraft> = {},
): SplitPartDraft {
  return {
    adjustment: false,
    cents: 0,
    description: "",
    key: newKey(),
    tags: [],
    type,
    ...overrides,
  };
}

// What leaves the account for one part: an expense is positive, an income negative; the adjustment keeps its sign.
function outflowCents(part: SplitPartDraft): number {
  return part.type === "INCOME" ? -part.cents : part.cents;
}

function partFromRow(row: PartRow): SplitPartDraft {
  const adjustment = row.systemKey === ADJUSTMENT_KEY;

  return {
    adjustment,
    categoryId: adjustment ? undefined : row.categoryId,
    cents: decimalStringToCents(row.value),
    description: row.descriptionInherited ? "" : row.description,
    id: row.id,
    key: newKey(),
    tags: row.tags.map((tag) => tag.name),
    type: row.type === "INCOME" ? "INCOME" : "EXPENSE",
  };
}

// What is left to distribute (spec 119 FR 42): positive = parts below the typed total, negative = above; 0 without a
// typed total.
function remainingCents(state: SplitFormState): number {
  return state.totalPaidCents > 0
    ? state.totalPaidCents - totalCents(state.parts)
    : 0;
}

function serializable(state: SplitFormState) {
  return {
    ...state,
    date: state.date.getTime(),
    parts: state.parts.map((part) => ({ ...part, key: "" })),
  };
}

function sharedParams(state: SplitFormState) {
  return {
    accountId: state.accountId,
    creditCardId: state.creditCardId,
    date: state.date.toISOString(),
    description: state.description.trim(),
    invoiceMonth: state.creditCardId ? state.invoiceMonth : undefined,
    notes: state.notes.trim() === "" ? null : state.notes.trim(),
    parts: state.parts.map((part) => toPartParams(part)),
    total:
      state.totalPaidCents > 0
        ? centsToDecimalString(state.totalPaidCents)
        : undefined,
  };
}

function stateFromSplit(result: SplitResultEntity): SplitFormState {
  const split: SplitEntity = result.split;
  const parts = [...result.parts].sort(
    (a, b) => (a.splitPosition ?? 0) - (b.splitPosition ?? 0),
  );

  return {
    accountId: split.accountId,
    creditCardId: split.creditCardId,
    date: new Date(split.date),
    description: split.description,
    invoiceMonth: split.invoiceMonth,
    notes: split.notes ?? "",
    paid: split.paid ?? true,
    parts: parts.map((row) => partFromRow(row)),
    totalPaidCents: 0,
  };
}

// A saved transaction turned into the first part of a new split (spec 119 FR 16).
function stateFromTransaction(row: PartRow): SplitFormState {
  return {
    accountId: row.accountId,
    creditCardId: row.creditCardId,
    date: new Date(row.date),
    description: row.description,
    invoiceMonth: row.invoiceMonth,
    notes: row.notes ?? "",
    paid: row.paid,
    parts: [
      { ...partFromRow(row), description: "" },
      newPart(row.type === "INCOME" ? "INCOME" : "EXPENSE"),
    ],
    totalPaidCents: decimalStringToCents(row.value),
  };
}

function toCreateParams(
  state: SplitFormState,
  fromTransactionId?: string,
): CreateSplitRepositoryParams {
  return {
    ...sharedParams(state),
    fromTransactionId,
    notes: state.notes.trim() === "" ? undefined : state.notes.trim(),
    paid: state.creditCardId ? undefined : state.paid,
  };
}

function toPartParams(part: SplitPartDraft): SplitPartRepositoryParams {
  const description = part.description.trim();

  return {
    categoryId: part.adjustment ? undefined : part.categoryId,
    description: description === "" ? null : description,
    id: part.id,
    systemKey: part.adjustment ? ADJUSTMENT_KEY : undefined,
    tags: part.tags,
    type: part.type,
    value: centsToDecimalString(part.cents),
  };
}

// The total of the split: the magnitude of the net, and its direction.
function totalCents(parts: SplitPartDraft[]): number {
  return Math.abs(netOutflowCents(parts));
}

function toUpdateParams(
  state: SplitFormState,
  id: string,
): UpdateSplitRepositoryParams {
  return {
    ...sharedParams(state),
    id,
    paid: state.creditCardId ? undefined : state.paid,
  };
}

function validate(
  state: SplitFormState,
  options: { isEditing: boolean },
): SplitFormErrors {
  const errors: SplitFormErrors = {};
  const isCard = !!state.creditCardId;

  if (state.description.trim() === "") {
    errors.description = "financial.split.errors.description";
  }
  if (!state.accountId && !state.creditCardId) {
    errors.source = "financial.split.errors.source";
  }
  if (state.parts.length < (options.isEditing ? 1 : MIN_PARTS)) {
    errors.parts = "financial.split.errors.tooFew";
  } else if (state.parts.length > MAX_PARTS) {
    errors.parts = "financial.split.errors.tooMany";
  }

  const partCategory: Record<string, TranslationKeys> = {};
  const partValue: Record<string, TranslationKeys> = {};

  state.parts.forEach((part) => {
    if (!part.adjustment && !part.categoryId) {
      partCategory[part.key] = "financial.split.errors.category";
    }
    if (part.adjustment ? part.cents === 0 : part.cents <= 0) {
      partValue[part.key] = "financial.split.errors.value";
    } else if (Math.abs(part.cents) > MAX_TRANSACTION_CENTS) {
      partValue[part.key] = "financial.split.errors.value";
    }
    if (isCard && part.type === "INCOME") {
      partValue[part.key] = "financial.split.cardExpenseOnly";
    }
  });
  if (Object.keys(partCategory).length > 0) {
    errors.partCategory = partCategory;
  }
  if (Object.keys(partValue).length > 0) {
    errors.partValue = partValue;
  }
  if (
    !errors.parts &&
    state.parts.length > 0 &&
    totalCents(state.parts) === 0
  ) {
    errors.total = "financial.split.errors.totalZero";
  } else if (remainingCents(state) !== 0) {
    errors.total = "financial.split.errors.mismatch";
  }

  return errors;
}

export {
  ADJUSTMENT_KEY,
  applyToAdjustment,
  applyToPart,
  createInitialState,
  isSameState,
  isValid,
  MAX_DESCRIPTION,
  MAX_NOTES,
  MAX_PARTS,
  MIN_PARTS,
  neededOutflowDelta,
  netOutflowCents,
  netType,
  newPart,
  outflowCents,
  remainingCents,
  stateFromSplit,
  stateFromTransaction,
  toCreateParams,
  totalCents,
  toUpdateParams,
  validate,
};
export type {
  PartRow,
  PartType,
  SplitFormErrors,
  SplitFormState,
  SplitPartDraft,
};
