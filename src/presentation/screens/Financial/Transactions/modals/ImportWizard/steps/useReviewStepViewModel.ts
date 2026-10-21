import { useState } from "react";

import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { invoiceMonthOf } from "@screens/Financial/models/invoiceMonth";
import {
  filterRows,
  ReviewFilter,
  ReviewRow,
} from "@screens/Financial/Transactions/models/importReview";

import { ImportWizardState } from "../useImportWizardViewModel";

const PAGE_SIZE = 100;

// The error codes the app has a message for; anything else reads as an invalid row.
const ERROR_CODES = [
  "ACCOUNT_AND_CARD",
  "ACCOUNT_ARCHIVED",
  "ACCOUNT_NOT_FOUND",
  "ACCOUNT_OR_CARD_MISSING",
  "AMOUNT_BOTH_OR_NONE",
  "CARD_CREDIT_NOT_SUPPORTED",
  "CARD_NOT_FOUND",
  "CATEGORY_ARCHIVED",
  "CATEGORY_MISSING",
  "CATEGORY_NOT_FOUND",
  "CURRENCY_MISMATCH",
  "DESCRIPTION_INVALID",
  "INVALID_DATE",
  "INVALID_VALUE",
  "SYSTEM_CATEGORY",
  "TAG_TOO_LONG",
  "TOO_MANY_TAGS",
  "TYPE_MISSING",
  "UNSUPPORTED_CURRENCY",
] as const;

export interface ReviewRowView {
  amount?: { cents: number; currency: string; type: "EXPENSE" | "INCOME" };
  amountText: string;
  category: string;
  checked: boolean;
  date: string;
  description: string;
  duplicate: boolean;
  errorCode?: "unknown" | ErrorCode;
  errorMessage?: string;
  // `MM/YY` of the invoice a card row lands on.
  invoice?: string;
  line: number;
  locked: boolean;
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

// Step 4 (spec 047 FR 27-32): the rows with their problems, the duplicates unchecked and the summary.
function useReviewStepViewModel(wizard: ImportWizardState) {
  const [filter, setFilter] = useState<ReviewFilter>("ALL");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { records } = wizard;
  const filtered = filterRows(wizard.review, filter);

  function view(row: ReviewRow): ReviewRowView {
    const payload = row.payload;
    const card = records.cards.find(
      (item) => item.id === payload?.creditCardId,
    );
    const account = records.accounts.find(
      (item) => item.id === payload?.accountId,
    );
    const category = records.categories.find(
      (item) => item.id === payload?.categoryId,
    );
    const invoice =
      card?.closingDay !== undefined && payload
        ? invoiceMonthOf(payload.date, card.closingDay)
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
      date: row.display.date,
      description: row.display.description,
      duplicate: row.duplicate,
      errorCode: knownCode(row.errorCode),
      errorMessage: row.errorMessage,
      invoice: invoice && `${invoice.slice(5)}/${invoice.slice(2, 4)}`,
      line: row.line,
      locked: row.locked,
      source: (card ?? account)?.name ?? "",
    };
  }

  const { summary } = wizard;
  const created =
    wizard.created.accounts + wizard.created.cards + wizard.created.categories;

  return {
    created,
    filter,
    hasMore: filtered.length > limit,
    ignoredSystemRows: wizard.built.ignoredSystemRows,
    onFilterChange: (value: string) => {
      setFilter(value as ReviewFilter);
      setLimit(PAGE_SIZE);
    },
    onRowToggle: (line: number, checked: boolean) =>
      wizard.onSelectionChange(line, checked),
    onShowMore: () => setLimit(limit + PAGE_SIZE),
    remaining: Math.max(filtered.length - limit, 0),
    rows: filtered.slice(0, limit).map(view),
    summary,
    total: wizard.review.length,
    validateFailed: !wizard.validated && !wizard.isValidating,
    validating: wizard.isValidating,
  };
}

export default useReviewStepViewModel;
