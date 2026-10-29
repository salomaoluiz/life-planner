import { useState } from "react";

import {
  CreditCategoryKey,
  creditKeyOf,
} from "@application/csvImport/cardCredits";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { invoiceMonthOf } from "@screens/Financial/models/invoiceMonth";
import {
  bulkSelection,
  filterRows,
  invoiceLines,
  ReviewBlock,
  ReviewFilter,
  ReviewGroup,
  reviewGroups,
  ReviewRecords,
  ReviewRow,
} from "@screens/Financial/Transactions/models/importReview";
import { NO_RECORDS } from "@screens/Financial/Transactions/models/importValues";

import { ImportWizardState } from "../useImportWizardViewModel";

const PAGE_SIZE = 100;

// The error codes the app has a message for; anything else reads as an invalid row.
const ERROR_CODES = [
  "ACCOUNT_AND_CARD",
  "ACCOUNT_ARCHIVED",
  "ACCOUNT_NOT_FOUND",
  "ACCOUNT_OR_CARD_MISSING",
  "AMOUNT_BOTH_OR_NONE",
  "CARD_CREDIT_CATEGORY_MISUSED",
  "CARD_INCOME_CATEGORY",
  "CARD_NOT_FOUND",
  "CATEGORY_ARCHIVED",
  "CATEGORY_MISSING",
  "CATEGORY_NOT_FOUND",
  "CURRENCY_MISMATCH",
  "DESCRIPTION_INVALID",
  "DUPLICATE_INVOICE_PAYMENT",
  "EARLY_PAYMENT_OVER_DUE",
  "INVALID_DATE",
  "INVALID_VALUE",
  "INVOICE_ALREADY_PAID",
  "INVOICE_MONTH_INVALID",
  "INVOICE_NOT_CLOSED",
  "INVOICE_PAID",
  "INVOICE_PAYMENT_MISMATCH",
  "PAID_FROM_ACCOUNT_INVALID",
  "SYSTEM_CATEGORY",
  "TAG_TOO_LONG",
  "TOO_MANY_TAGS",
  "TYPE_MISSING",
  "UNSUPPORTED_CURRENCY",
] as const;

export interface ReviewBlockView extends Omit<ReviewBlock, "groups"> {
  groups: ReviewGroupView[];
}

// Spec 049: a group as the review renders it — its totals and only the rows of the current page.
export interface ReviewGroupView extends Omit<ReviewGroup, "rows"> {
  emptyInFilter: boolean;
  rows: ReviewRowView[];
}

export interface ReviewRowView {
  amount?: { cents: number; currency: string; type: "EXPENSE" | "INCOME" };
  amountText: string;
  category: string;
  checked: boolean;
  // The system category of a card credit or payment (spec 048).
  creditKey?: CreditCategoryKey;
  date: string;
  description: string;
  duplicate: boolean;
  errorCode?: "unknown" | ErrorCode;
  errorMessage?: string;
  errorParams?: Record<string, number | string>;
  // `MM/YY` of the invoice a card row lands on.
  invoice?: string;
  // Early payments and invoice payments: the account they are paid from, or none (boleto).
  isPayment: boolean;
  line: number;
  locked: boolean;
  paidFrom?: string;
  source: string;
}

type ErrorCode = (typeof ERROR_CODES)[number];

function knownCode(code?: string): "unknown" | ErrorCode | undefined {
  if (!code) {
    return undefined;
  }

  return (ERROR_CODES as readonly string[]).includes(code)
    ? (code as ErrorCode)
    : "unknown";
}

// Step 4 (spec 047 FR 27-32, spec 049): the rows in blocks and groups with their subtotals, the summary and the
// manual refresh state.
function useReviewStepViewModel(wizard: ImportWizardState) {
  const [filter, setFilter] = useState<ReviewFilter>("ALL");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { catalog } = wizard;
  const filtered = filterRows(wizard.review, filter);
  const allAccounts = Object.values(catalog).flatMap((item) => item.accounts);
  const allCards = Object.values(catalog).flatMap((item) => item.cards);
  const records: ReviewRecords = { accounts: allAccounts, cards: allCards };
  const inFilter = new Set(filtered.map((row) => row.line));
  const onPage = new Set(filtered.slice(0, limit).map((row) => row.line));

  function view(row: ReviewRow): ReviewRowView {
    const payload = row.payload;
    const rowRecords =
      catalog[payload?.ownerId ?? wizard.ownerId] ?? NO_RECORDS;
    const card = rowRecords.cards.find(
      (item) => item.id === payload?.creditCardId,
    );
    const account = rowRecords.accounts.find(
      (item) => item.id === payload?.accountId,
    );
    const category = rowRecords.categories.find(
      (item) => item.id === payload?.categoryId,
    );
    const creditKey = payload && creditKeyOf(payload.categoryId);
    const isPayment =
      creditKey === "CARD_EARLY_PAYMENT" || creditKey === "INVOICE_PAYMENT";
    const invoice =
      payload?.invoiceMonth ??
      (card?.closingDay !== undefined && payload && !isPayment
        ? invoiceMonthOf(payload.date, card.closingDay)
        : undefined);
    const paidFrom = payload?.paidFromAccountId
      ? allAccounts.find((item) => item.id === payload.paidFromAccountId)?.name
      : undefined;

    return {
      amount: payload && {
        cents: payload.value,
        currency:
          payload.currency ?? (card ?? account)?.currency ?? DEFAULT_CURRENCY,
        type: payload.type,
      },
      amountText: row.display.amount,
      category: category?.name ?? "",
      checked: row.checked,
      creditKey,
      date: row.display.date,
      description: row.display.description,
      duplicate: row.duplicate,
      errorCode: knownCode(row.errorCode),
      errorMessage: row.errorMessage,
      errorParams: row.errorParams,
      invoice: invoice && `${invoice.slice(5, 7)}/${invoice.slice(2, 4)}`,
      isPayment,
      line: row.line,
      locked: row.locked,
      paidFrom,
      source: (card ?? account)?.name ?? "",
    };
  }

  const blocks: ReviewBlockView[] = reviewGroups(wizard.review, records).map(
    (block) => ({
      ...block,
      groups: block.groups.map((group) => ({
        ...group,
        emptyInFilter: !group.rows.some((row) => inFilter.has(row.line)),
        rows: group.rows
          .filter((row) => onPage.has(row.line))
          .map((row) => view(row)),
      })),
    }),
  );
  // Spec 054 FR 16-20: select / unselect every row without error of the filter; hidden on Errors.
  const bulk = bulkSelection(filtered);
  const bulkVisible = filter !== "ERRORS" && bulk.lines.length > 0;
  const { summary } = wizard;
  const created =
    wizard.created.accounts + wizard.created.cards + wizard.created.categories;

  return {
    blocks,
    bulk: {
      count: bulk.uncheckedCount,
      mode: bulk.allChecked ? ("unselect" as const) : ("select" as const),
      visible: bulkVisible,
    },
    canRefresh: wizard.review.length > 0 && !wizard.isValidating,
    created,
    filter,
    filteredCount: filtered.length,
    hasMore: filtered.length > limit,
    ignoredSystemRows: wizard.built.ignoredSystemRows,
    invoices: invoiceLines(
      wizard.invoices,
      (id) => allCards.find((item) => item.id === id)?.name ?? "",
    ),
    kinds: wizard.kinds,
    onBulkToggle: () =>
      wizard.onSelectionBulkChange(bulk.lines, !bulk.allChecked),
    onFilterChange: (value: string) => {
      setFilter(value as ReviewFilter);
      setLimit(PAGE_SIZE);
    },
    onRefresh: wizard.onRefresh,
    onRowToggle: (line: number, checked: boolean) =>
      wizard.onSelectionChange(line, checked),
    onShowMore: () => setLimit(limit + PAGE_SIZE),
    refreshFailed: wizard.refreshFailed,
    refreshing: wizard.isRefreshing,
    remaining: Math.max(filtered.length - limit, 0),
    stale: wizard.stale,
    summary,
    total: wizard.review.length,
    validateFailed: !wizard.validated && !wizard.isValidating,
    validating: wizard.isValidating && !wizard.validated,
    wide: wizard.wide,
  };
}

export default useReviewStepViewModel;
