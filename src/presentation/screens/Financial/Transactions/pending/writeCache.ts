import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { SUPPORTED_CURRENCIES } from "@domain/entities/financial/Currency";
import {
  invalidateFetcherData,
  markFetcherDataStale,
  updateCachedFetcherData,
} from "@infrastructure/fetcher";

import { TransactionsData } from "../models/transactionsData";
import TransactionUIModel from "../models/TransactionUIModel";
import { PendingChange } from "./pendingChanges";

type ChangeShape = Pick<PendingChange, "kind" | "previous" | "row" | "target">;

// Spec 076: what a transaction write can move, as the months (`YYYY-MM`) of the lists it touches. A series or an
// installment plan reaches rows in many months, so it says `"all"`.
interface WriteScope {
  invoiceMonths: "all" | string[];
  listMonths: "all" | string[];
  projections: boolean;
}

// Refreshes what a write moved. A month entry holds the rows, invoices, balances, projections and summary of the month
// (spec 080), so it is refreshed even when the rows were patched in memory: the patch shows the saved row at once, the
// refetch brings the totals; `refetch: false` only marks the queries stale, for a write made in a modal over the screen.
async function invalidateAfterWrite(
  scope: WriteScope,
  { refetch = true } = {},
) {
  const invalidate = refetch ? invalidateFetcherData : markFetcherDataStale;
  const keys: string[][] = [
    financeKeys.transactionsFiltered.all(),
    financeKeys.invoices.list("filtered"),
    financeKeys.accounts.all(),
    financeKeys.creditCards.all(),
    financeKeys.creditCardsOverview.all(),
    financeKeys.upcoming.all(),
  ];
  const months = new Set<string>();
  let everyMonth = false;

  [scope.listMonths, scope.invoiceMonths].forEach((list) => {
    if (list === "all") {
      everyMonth = true;

      return;
    }
    list.forEach((month) => months.add(month));
  });

  keys.push(
    ...(everyMonth
      ? [financeKeys.transactions.list()]
      : [...months].map((month) => financeKeys.transactions.list(month))),
  );
  if (scope.invoiceMonths === "all") {
    keys.push(financeKeys.invoices.list(), financeKeys.invoice.all());
  } else if (scope.invoiceMonths.length > 0) {
    keys.push(
      ...scope.invoiceMonths.map((month) => financeKeys.invoices.list(month)),
      financeKeys.invoice.all(),
    );
  }
  if (everyMonth) {
    keys.push(financeKeys.dailyBalances.all(), financeKeys.summary.all());
  } else {
    months.forEach((month) =>
      keys.push(
        financeKeys.dailyBalances.monthPrefix(month),
        financeKeys.summary.monthPrefix(month),
      ),
    );
  }
  if (scope.projections) {
    keys.push(financeKeys.projections.all());
  }
  if (scope.listMonths === "all") {
    keys.push(
      financeKeys.recurrences.all(),
      financeKeys.installmentPlans.all(),
      financeKeys.tags.all(),
    );
  }

  await Promise.all(keys.map(async (key) => invalidate(key)));
}

function involvesSeries(dto?: TransactionDTO) {
  return !!dto && (!!dto.recurrenceId || !!dto.installmentPlanId);
}

// Only a plain account row is patched in memory: a card purchase lives on its invoice, and a series or an installment
// plan moves rows in many months (those refetch).
function isPatchable(change: ChangeShape) {
  const dtos = [change.row, change.previous];

  if (
    dtos.some((dto) => !!dto?.creditCardId || involvesSeries(dto)) ||
    change.target?.recurrenceId
  ) {
    return false;
  }
  switch (change.kind) {
    case "create":
      return !!change.row;
    case "delete":
      return !!change.target?.transactionId;
    case "edit":
      return !!change.row && !!change.previous;
  }
}

// The month list the row is shown in, the way the screen buckets it.
function listMonthOf(dto: TransactionDTO) {
  return new TransactionUIModel(dto).monthKey;
}

// Shows the saved rows without downloading the month again: a delete drops the row, a create adds it under the id the
// API gave, an edit swaps it (and moves it when the date changed month). Months that are not cached are left alone;
// they are fetched fresh when opened. Applying the same patch twice, or after a refetch brought the row, changes nothing.
function patchMonthLists(change: ChangeShape, resolvedId?: string) {
  const saved = savedRow(change, resolvedId);

  updateCachedFetcherData<TransactionsData>(
    financeKeys.transactions.list(),
    (data, queryKey) => {
      if (!data.items) {
        return data;
      }
      // [finance, transactions, list, month, scope owner ids joined by "," (spec 080), currency (spec 103), ...every owner id]
      const month = String(queryKey[3]);
      const ownerIds = String(queryKey[4]).split(",");
      // Spec 103: a month is cached per currency (after the scope); a row only belongs to its own currency's list.
      const keyCurrency = SUPPORTED_CURRENCIES.find(
        (code) => code === queryKey[5],
      );

      if (change.kind === "delete") {
        return {
          ...data,
          items: data.items.filter(
            (item) => item.id !== change.target?.transactionId,
          ),
        };
      }
      const replacedId = change.previous?.id ?? saved!.id;
      const belongs =
        listMonthOf(saved!) === month &&
        ownerIds.includes(saved!.ownerId) &&
        (!keyCurrency || keyCurrency === saved!.currency);
      const uiModel = new TransactionUIModel(
        saved!,
        data.categories?.find((category) => category.id === saved!.categoryId),
      );
      const exists = data.items.some(
        (item) => item.id === replacedId || item.id === saved!.id,
      );

      if (!belongs) {
        return {
          ...data,
          items: data.items.filter((item) => item.id !== replacedId),
        };
      }

      return {
        ...data,
        items: exists
          ? data.items.map((item) =>
              item.id === replacedId || item.id === saved!.id ? uiModel : item,
            )
          : [...data.items, uiModel],
      };
    },
  );
}

function savedRow(change: ChangeShape, resolvedId?: string) {
  if (!change.row) {
    return undefined;
  }

  return new TransactionDTO({
    ...change.row,
    id:
      change.kind === "create" ? (resolvedId ?? change.row.id) : change.row.id,
  });
}

function scopeOfChange(change: ChangeShape): WriteScope {
  const dtos = [change.row, change.previous].filter(
    (dto): dto is TransactionDTO => !!dto,
  );

  if (
    dtos.some(involvesSeries) ||
    change.target?.recurrenceId ||
    dtos.length === 0
  ) {
    return {
      invoiceMonths: "all",
      listMonths: "all",
      projections:
        dtos.some((dto) => !!dto.recurrenceId) || !!change.target?.recurrenceId,
    };
  }
  const cardRows = dtos.filter((dto) => !!dto.creditCardId);

  return {
    invoiceMonths: unique(cardRows.map((dto) => dto.invoiceMonth)),
    listMonths: unique(
      dtos.filter((dto) => !dto.creditCardId).map(listMonthOf),
    ),
    projections: false,
  };
}

function unique(values: (string | undefined)[]) {
  return [...new Set(values.filter((value): value is string => !!value))];
}

export type { WriteScope };
export { invalidateAfterWrite, isPatchable, patchMonthLists, scopeOfChange };
