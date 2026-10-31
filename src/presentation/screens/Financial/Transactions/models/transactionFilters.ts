import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";

import CardInvoiceUIModel from "./CardInvoiceUIModel";
import TransactionUIModel from "./TransactionUIModel";

export interface FilteredSummary {
  count: number;
  expenseCents: number;
  incomeCents: number;
  resultCents: number;
}
export type FilterGroup =
  | "categories"
  | "origin"
  | "period"
  | "situation"
  | "sources"
  | "tags";
export type FilterOrigin = "ACCOUNT" | "CARD";
export interface FilterPeriod {
  // `YYYY-MM-DD`, inclusive
  from: string;
  to: string;
}

export type FilterSituation = "PAID" | "UNPAID";

export type PeriodPreset = "LAST_3_MONTHS" | "THIS_MONTH" | "THIS_YEAR";

// The filters of the Transactions screen (spec 045 FR 1); scope and type live apart.
export interface TransactionFilters {
  accountIds: string[];
  cardIds: string[];
  categoryIds: string[];
  origin?: FilterOrigin;
  period?: FilterPeriod;
  search: string;
  situation?: FilterSituation;
  tagIds: string[];
}

export const EMPTY_FILTERS: TransactionFilters = {
  accountIds: [],
  cardIds: [],
  categoryIds: [],
  search: "",
  tagIds: [],
};

type PeriodValidation = { maxTo: string; ok: false } | { ok: true };

// Groups that count in the badge; the search is visible in the toolbar, so it does not count.
function activeGroups(filters: TransactionFilters): FilterGroup[] {
  const groups: FilterGroup[] = [];

  if (filters.period) {
    groups.push("period");
  }
  if (filters.origin) {
    groups.push("origin");
  }
  if (filters.accountIds.length + filters.cardIds.length > 0) {
    groups.push("sources");
  }
  if (filters.categoryIds.length > 0) {
    groups.push("categories");
  }
  if (filters.tagIds.length > 0) {
    groups.push("tags");
  }
  if (filters.situation) {
    groups.push("situation");
  }

  return groups;
}

function clearGroup(
  filters: TransactionFilters,
  group: FilterGroup,
): TransactionFilters {
  switch (group) {
    case "categories":
      return { ...filters, categoryIds: [] };
    case "origin":
      return { ...filters, origin: undefined };
    case "period":
      return { ...filters, period: undefined };
    case "situation":
      return { ...filters, situation: undefined };
    case "sources":
      return { ...filters, accountIds: [], cardIds: [] };
    default:
      return { ...filters, tagIds: [] };
  }
}

// The range the queries use: the period, else the month on screen.
function effectiveRange(
  filters: TransactionFilters,
  month: Date,
): FilterPeriod {
  return (
    filters.period ?? {
      from: toDateKey(new Date(month.getFullYear(), month.getMonth(), 1)),
      to: toDateKey(lastDayOfMonth(month.getFullYear(), month.getMonth())),
    }
  );
}

function isFiltering(filters: TransactionFilters) {
  return activeGroups(filters).length > 0 || filters.search.trim() !== "";
}

function lastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0);
}

// Spec 061 FR 4: would a row that is still being saved be listed under these filters? Conservative: what the app
// cannot decide alone (a category chosen with its children) answers no, and the refetch brings the row in.
function matchesPendingFilters(
  row: TransactionDTO,
  filters: TransactionFilters,
) {
  const isCard = !!row.creditCardId;
  const dateKey = toDateKey(new Date(row.date));

  if (
    filters.period &&
    (dateKey < filters.period.from || dateKey > filters.period.to)
  ) {
    return false;
  }
  if (filters.origin === "CARD" && !isCard) {
    return false;
  }
  if (filters.origin === "ACCOUNT" && isCard) {
    return false;
  }
  if (
    (filters.accountIds.length > 0 || filters.cardIds.length > 0) &&
    !(
      (row.accountId && filters.accountIds.includes(row.accountId)) ||
      (row.creditCardId && filters.cardIds.includes(row.creditCardId))
    )
  ) {
    return false;
  }
  if (
    filters.categoryIds.length > 0 &&
    !filters.categoryIds.includes(row.categoryId)
  ) {
    return false;
  }
  if (
    filters.tagIds.length > 0 &&
    !row.tags.some((tag) => filters.tagIds.includes(tag.id))
  ) {
    return false;
  }
  if (filters.situation && (filters.situation === "PAID") !== row.paid) {
    return false;
  }
  const search = normalizeText(filters.search.trim());

  return (
    !search ||
    normalizeText(
      `${row.description} ${row.notes ?? ""} ${row.category}`,
    ).includes(search)
  );
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function periodPreset(kind: PeriodPreset, today: Date): FilterPeriod {
  const year = today.getFullYear();
  const month = today.getMonth();

  if (kind === "THIS_YEAR") {
    return {
      from: toDateKey(new Date(year, 0, 1)),
      to: toDateKey(new Date(year, 11, 31)),
    };
  }

  const first = kind === "THIS_MONTH" ? month : month - 2;

  return {
    from: toDateKey(new Date(year, first, 1)),
    to: toDateKey(lastDayOfMonth(year, month)),
  };
}

// Totals of the filtered result: account rows plus filtered invoices (card purchases count one by one).
function summarize(
  items: TransactionUIModel[],
  invoices: CardInvoiceUIModel[],
): FilteredSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  let count = 0;

  items
    .filter((item) => !item.isAdjustment)
    .forEach((item) => {
      count += 1;
      if (item.isExpense) {
        expenseCents += item.amountCents;
      } else {
        incomeCents += item.amountCents;
      }
    });
  invoices.forEach((invoice) => {
    expenseCents += invoice.amountCents;
    count += invoice.matchedCount + invoice.projectedItems.length;
  });

  return {
    count,
    expenseCents,
    incomeCents,
    resultCents: incomeCents - expenseCents,
  };
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// The API filter. Search and period are sent as they are; cards narrow invoices and card series.
function toQueryFilter(filters: TransactionFilters): TransactionQueryFilter {
  return {
    accountIds: filters.accountIds,
    categoryIds: filters.categoryIds,
    creditCardIds: filters.cardIds,
    from: filters.period?.from,
    paid:
      filters.situation === undefined
        ? undefined
        : filters.situation === "PAID",
    q: filters.search.trim() || undefined,
    tagIds: filters.tagIds,
    to: filters.period?.to,
  };
}

// `to` on or after `from` and at most `from` + 2 years - 1 day (spec 045 FR 1); `maxTo` is the last valid end.
function validatePeriod(from: string, to: string): PeriodValidation {
  const [year, month, day] = from.split("-").map(Number);
  const maxTo = toDateKey(new Date(year + 2, month - 1, day - 1));

  return to >= from && to <= maxTo ? { ok: true } : { maxTo, ok: false };
}

// Account rows disappear when only cards were chosen (or origin is Card), and the other way around.
function wantsAccountRows(filters: TransactionFilters) {
  return (
    filters.origin !== "CARD" &&
    !(filters.cardIds.length > 0 && filters.accountIds.length === 0)
  );
}

function wantsCards(filters: TransactionFilters) {
  return (
    filters.origin !== "ACCOUNT" &&
    !(filters.accountIds.length > 0 && filters.cardIds.length === 0)
  );
}

export {
  activeGroups,
  clearGroup,
  effectiveRange,
  isFiltering,
  matchesPendingFilters,
  periodPreset,
  summarize,
  toDateKey,
  toQueryFilter,
  validatePeriod,
  wantsAccountRows,
  wantsCards,
};
