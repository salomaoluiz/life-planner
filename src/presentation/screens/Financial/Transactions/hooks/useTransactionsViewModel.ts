import { useIsFocused } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";

import { MonthSummary } from "@application/dto/home/MonthSummaryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";
import { useQuery } from "@infrastructure/fetcher";
import useTranslationLocale from "@presentation/i18n/useTranslationLocale";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import { addMonthsTo } from "@screens/Financial/models/invoiceMonth";
import {
  activeOwnerIds,
  archivedOwnerIds,
  buildOwnerFilterChoices,
  personalOwnerId as findPersonalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import { listQueryKey } from "@screens/Financial/models/queryKeys";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import CardInvoiceUIModel from "../models/CardInvoiceUIModel";
import {
  activeGroups,
  effectiveRange,
  isFiltering,
  summarize,
  toDateKey,
  toQueryFilter,
  wantsAccountRows,
  wantsCards,
} from "../models/transactionFilters";
import {
  ALL_FILTER,
  buildEntries,
  DayBalanceView,
  filterByOwner,
  filterByType,
  filterInvoicesByOwner,
  filterInvoicesByType,
  formatMonthLabel,
  formatMonthName,
  isInMonth,
  mergeProjectedInvoices,
  monthChoices,
  ProjectedInvoiceGroup,
  shiftMonth,
  startOfMonth,
  stickyIndices,
  toDayBalanceViews,
  TypeFilter,
} from "../models/transactionList";
import TransactionUIModel from "../models/TransactionUIModel";
import { consumePendingNavigation } from "./pendingNavigation";
import useTransactionFilters from "./useTransactionFilters";

// Balances exist up to this many months after the current one (spec 035 FR 10).
const MAX_BALANCE_MONTHS_AHEAD = 12;
// The projections endpoint answers at most this many months.
const MAX_PROJECTION_MONTHS = 12;

// What the API projects for the months after the current one (spec 034 FR 14).
interface ProjectedData {
  accountItems: TransactionUIModel[];
  cardGroups: ProjectedInvoiceGroup[];
}

interface TransactionsData {
  items: TransactionUIModel[];
  owners: OwnerDTO[];
}

// Spec 045: the account rows that match the filters in the range.
async function fetchFilteredTransactions(
  ownerIds: string[],
  filter: TransactionQueryFilter,
): Promise<TransactionUIModel[]> {
  const [transactions, categories] = await Promise.all([
    useCases.getFinancialFilteredTransactionsUseCase.execute({
      filter,
      ownerIds,
    }),
    useCases.getFinancialCategoriesUseCase.execute(ownerIds),
  ]);
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  return transactions.map(
    (transaction) =>
      new TransactionUIModel(
        transaction,
        categoryById.get(transaction.categoryId),
      ),
  );
}

async function fetchProjections(
  from: string,
  to: string,
  ownerIds: string[],
  filter?: TransactionQueryFilter,
): Promise<ProjectedData> {
  const [items, categories] = await Promise.all([
    useCases.getFinancialProjectionsUseCase.execute({
      filter,
      from,
      ownerIds,
      to,
    }),
    useCases.getFinancialCategoriesUseCase.execute(ownerIds),
  ]);
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const groups = new Map<string, ProjectedInvoiceGroup>();
  const accountItems: TransactionUIModel[] = [];

  items.forEach((item) => {
    const row = new TransactionUIModel(
      item.toTransactionDTO(),
      categoryById.get(item.categoryId),
    );

    if (!item.creditCardId) {
      accountItems.push(row);

      return;
    }
    if (!item.invoiceListDate || !item.invoiceMonth) {
      return;
    }

    const key = `${item.creditCardId}:${item.invoiceMonth}`;
    const group = groups.get(key) ?? {
      card: item.toInvoiceCard()!,
      items: [],
      listDate: item.invoiceListDate,
      referenceMonth: item.invoiceMonth,
    };

    group.items.push(row);
    groups.set(key, group);
  });

  return { accountItems, cardGroups: [...groups.values()] };
}

async function fetchSummary(
  month: Date,
  ownerIds: string[],
): Promise<MonthSummary> {
  return useCases.getMonthSummaryUseCase.execute({ month, ownerIds });
}

async function fetchTransactions(): Promise<TransactionsData> {
  const owners = await useCases.getOwnersUseCase.execute();
  const ownerIds = owners.map((owner) => owner.id);
  const [transactions, categories] = await Promise.all([
    useCases.getFinancialTransactionsUseCase.execute({ ownerIds }),
    useCases.getFinancialCategoriesUseCase.execute(ownerIds),
  ]);
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  return {
    items: transactions.map(
      (transaction) =>
        new TransactionUIModel(
          transaction,
          categoryById.get(transaction.categoryId),
        ),
    ),
    owners,
  };
}

// The later of two `YYYY-MM` keys.
function maxMonth(a: string, b: string) {
  return a > b ? a : b;
}

// `YYYY-MM` of the local month.
function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Spec 045 FR 11 of the NFR: the previous result stays on screen while a new filter loads.
function useKept<T>(data: T | undefined): T | undefined {
  const ref = useRef<T>();

  if (data !== undefined) {
    ref.current = data;
  }

  return data ?? ref.current;
}

function useTransactionsViewModel() {
  const isFocused = useIsFocused();
  const { getLocale } = useTranslationLocale();
  const languageTag = getLocale().languageTag ?? "en-US";

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [ownerSelection, setOwnerSelection] = useState(ALL_FILTER);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(month.getFullYear());

  const transactions = useQuery<TransactionsData>({
    cacheKey: listQueryKey(useCases.getFinancialTransactionsUseCase.uniqueName),
    fetch: fetchTransactions,
  });

  const owners = transactions.data?.owners;
  // A selected family that is no longer an owner (user left it) falls back to All.
  const ownerFilter =
    ownerSelection === ALL_FILTER ||
    (owners ?? []).some((owner) => owner.id === ownerSelection)
      ? ownerSelection
      : ALL_FILTER;
  const summaryOwnerIds = useMemo(
    () =>
      ownerFilter === ALL_FILTER ? activeOwnerIds(owners ?? []) : [ownerFilter],
    [ownerFilter, owners],
  );

  const archivedIds = useMemo(() => archivedOwnerIds(owners ?? []), [owners]);
  const scope = useReadOnlyScope(owners, ownerFilter);
  const { openModal } = useModalNavigation();

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const allOwnerIds = useMemo(
    () => (owners ?? []).map((owner) => owner.id),
    [owners],
  );
  // A failing invoices request keeps the account rows: only the inline error row appears.
  const invoices = useQuery<CardInvoiceUIModel[]>({
    cacheKey: [
      ...listQueryKey(
        useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
      ),
      monthKey,
      ...allOwnerIds,
    ],
    enabled: !!owners,
    fetch: async () =>
      (
        await useCases.getFinancialCardInvoicesForMonthUseCase.execute({
          month: monthKey,
          ownerIds: allOwnerIds,
        })
      ).map((invoice) => new CardInvoiceUIModel(invoice)),
  });
  // Months after the current one also show what the series will create. Card purchases show on the invoice
  // they would land on, which appears up to two months after the purchase: the range looks that far back.
  const currentMonthKey = toMonthKey(new Date());
  const isFutureMonth = monthKey > currentMonthKey;
  const projectionsFrom = maxMonth(
    addMonthsTo(monthKey, -2),
    addMonthsTo(currentMonthKey, 1),
  );
  const projections = useQuery<ProjectedData>({
    cacheKey: [
      ...listQueryKey(useCases.getFinancialProjectionsUseCase.uniqueName),
      projectionsFrom,
      monthKey,
      ...allOwnerIds,
    ],
    enabled: !!owners && isFutureMonth,
    fetch: async () => fetchProjections(projectionsFrom, monthKey, allOwnerIds),
  });
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string>();
  const [expandedDayKey, setExpandedDayKey] = useState<string>();

  // End-of-day balances of the scope filter (spec 035). They load in parallel with the list and never block it:
  // a failed or missing request leaves the day headers with their net, and the type filter never touches them.
  const balancesEnabled =
    !!owners &&
    summaryOwnerIds.length > 0 &&
    monthKey <= addMonthsTo(currentMonthKey, MAX_BALANCE_MONTHS_AHEAD);
  const balances = useQuery<Map<string, DayBalanceView>>({
    cacheKey: [
      ...listQueryKey(useCases.getFinancialDailyBalancesUseCase.uniqueName),
      monthKey,
      ...summaryOwnerIds,
    ],
    enabled: balancesEnabled,
    fetch: async () =>
      toDayBalanceViews(
        await useCases.getFinancialDailyBalancesUseCase.execute({
          month: monthKey,
          ownerIds: summaryOwnerIds,
        }),
      ),
  });

  // Spec 045: while a filter is active the list comes from the filtered queries, over the period
  // (or the month on screen); the unfiltered queries above keep serving the plain month.
  const filterStore = useTransactionFilters();
  const { applied } = filterStore;
  const filtering = isFiltering(applied);
  const range = useMemo(() => effectiveRange(applied, month), [applied, month]);
  const queryFilter = useMemo<TransactionQueryFilter>(
    () => ({ ...toQueryFilter(applied), from: range.from, to: range.to }),
    [applied, range],
  );
  const filterKey = JSON.stringify(queryFilter);
  const showAccountRows = wantsAccountRows(applied);
  const showCards = wantsCards(applied);
  const filteredTransactions = useQuery<TransactionUIModel[]>({
    cacheKey: [
      ...listQueryKey(
        useCases.getFinancialFilteredTransactionsUseCase.uniqueName,
      ),
      filterKey,
      ...allOwnerIds,
    ],
    enabled: !!owners && filtering && showAccountRows,
    fetch: async () => fetchFilteredTransactions(allOwnerIds, queryFilter),
  });
  const filteredInvoices = useQuery<CardInvoiceUIModel[]>({
    cacheKey: [
      ...listQueryKey(
        useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
      ),
      "filtered",
      filterKey,
      ...allOwnerIds,
    ],
    enabled: !!owners && filtering && showCards,
    fetch: async () =>
      (
        await useCases.getFinancialCardInvoicesForMonthUseCase.execute({
          filter: queryFilter,
          ownerIds: allOwnerIds,
        })
      ).map((invoice) => new CardInvoiceUIModel(invoice)),
  });
  // Projections only exist after the current month, and are never paid.
  const rangeFromMonth = range.from.slice(0, 7);
  const rangeToMonth = range.to.slice(0, 7);
  const filteredProjectionsFrom = maxMonth(
    addMonthsTo(rangeFromMonth, -2),
    addMonthsTo(currentMonthKey, 1),
  );
  const filteredProjectionsTo = [
    rangeToMonth,
    addMonthsTo(filteredProjectionsFrom, MAX_PROJECTION_MONTHS - 1),
  ].sort()[0];
  const filteredProjections = useQuery<ProjectedData>({
    cacheKey: [
      ...listQueryKey(useCases.getFinancialProjectionsUseCase.uniqueName),
      "filtered",
      filteredProjectionsFrom,
      filteredProjectionsTo,
      filterKey,
      ...allOwnerIds,
    ],
    enabled:
      !!owners &&
      filtering &&
      filteredProjectionsFrom <= filteredProjectionsTo &&
      applied.situation !== "PAID",
    fetch: async () =>
      fetchProjections(
        filteredProjectionsFrom,
        filteredProjectionsTo,
        allOwnerIds,
        queryFilter,
      ),
  });
  const keptFilteredItems = useKept(filteredTransactions.data);
  const keptFilteredInvoices = useKept(filteredInvoices.data);
  const keptFilteredProjections = useKept(filteredProjections.data);

  const summary = useQuery<MonthSummary>({
    cacheKey: [
      useCases.getMonthSummaryUseCase.uniqueName,
      `${month.getFullYear()}-${month.getMonth()}`,
      ...summaryOwnerIds,
    ],
    enabled: !!owners,
    fetch: async () => fetchSummary(month, summaryOwnerIds),
  });

  function refetchFiltered() {
    if (showAccountRows) {
      filteredTransactions.refetch();
    }
    if (showCards) {
      filteredInvoices.refetch();
    }
    filteredProjections.refetch();
  }

  // A new month or scope shows other days: nothing stays expanded.
  useEffect(() => {
    setExpandedDayKey(undefined);
  }, [monthKey, ownerFilter]);

  useEffect(() => {
    if (isFocused) {
      const pendingNavigation = consumePendingNavigation();

      if (pendingNavigation?.scope) {
        setOwnerSelection(pendingNavigation.scope);
      }
      if (pendingNavigation?.type) {
        setTypeFilter(pendingNavigation.type);
      }
      transactions.refetch();
      invoices.refetch();
      summary.refetch();
      if (balancesEnabled) {
        balances.refetch();
      }
      if (isFutureMonth) {
        projections.refetch();
      }
      if (filtering) {
        refetchFiltered();
      }
    }
  }, [isFocused]);

  function inRange(dateKey: string) {
    return dateKey >= range.from && dateKey <= range.to;
  }
  const itemsOfMonth = useMemo(
    () =>
      filtering
        ? [
            ...(showAccountRows ? (keptFilteredItems ?? []) : []),
            ...(showAccountRows
              ? (keptFilteredProjections?.accountItems ?? [])
              : []
            ).filter((item) => inRange(toDateKey(item.date))),
          ]
        : [
            ...(transactions.data?.items ?? []).filter(
              (item) => !item.isCardPurchase && isInMonth(item.date, month),
            ),
            ...(isFutureMonth
              ? (projections.data?.accountItems ?? [])
              : []
            ).filter((item) => isInMonth(item.date, month)),
          ],
    [
      transactions.data,
      projections.data,
      month,
      isFutureMonth,
      filtering,
      showAccountRows,
      keptFilteredItems,
      keptFilteredProjections,
      range,
    ],
  );
  // Real invoices of the month carrying their projections, plus the invoices that only exist as projections.
  const allInvoices = useMemo(
    () =>
      filtering
        ? mergeProjectedInvoices(
            showCards ? (keptFilteredInvoices ?? []) : [],
            showCards
              ? (keptFilteredProjections?.cardGroups ?? []).filter((group) =>
                  inRange(group.listDate),
                )
              : [],
          )
        : mergeProjectedInvoices(
            invoices.data ?? [],
            isFutureMonth
              ? (projections.data?.cardGroups ?? []).filter(
                  (group) => group.listDate.slice(0, 7) === monthKey,
                )
              : [],
          ),
    [
      invoices.data,
      projections.data,
      monthKey,
      isFutureMonth,
      filtering,
      showCards,
      keptFilteredInvoices,
      keptFilteredProjections,
      range,
    ],
  );
  const visible = useMemo(
    () =>
      filterByType(
        filterByOwner(itemsOfMonth, ownerFilter, archivedIds),
        typeFilter,
      ),
    [itemsOfMonth, ownerFilter, archivedIds, typeFilter],
  );
  // The month is empty when no data is left once the archived families are out of "All" (spec 042):
  // the owner and type chips never change it.
  const countedArchivedIds = useMemo(
    () => (ownerFilter === ALL_FILTER ? archivedIds : new Set<string>()),
    [ownerFilter, archivedIds],
  );
  const scopedItemsOfMonth = useMemo(
    () => itemsOfMonth.filter((item) => !countedArchivedIds.has(item.ownerId)),
    [itemsOfMonth, countedArchivedIds],
  );
  const invoicesOfMonth = useMemo(
    () =>
      allInvoices.filter((invoice) => !countedArchivedIds.has(invoice.ownerId)),
    [allInvoices, countedArchivedIds],
  );
  const visibleInvoices = useMemo(
    () =>
      filterInvoicesByType(
        filterInvoicesByOwner(allInvoices, ownerFilter, archivedIds),
        typeFilter,
      ),
    [allInvoices, ownerFilter, archivedIds, typeFilter],
  );
  // A balance of a filtered list has no meaning: the day lines go away while a filter is active (spec 045 FR 14).
  const balanceViews = useMemo(
    () => (balances.error || filtering ? undefined : balances.data),
    [balances.data, balances.error, filtering],
  );
  const filteredSummary = useMemo(
    () => (filtering ? summarize(visible, visibleInvoices) : undefined),
    [filtering, visible, visibleInvoices],
  );
  const entries = useMemo(
    () =>
      buildEntries(visible, new Date(), visibleInvoices, {
        balances: balanceViews,
        expandedDateKey: expandedDayKey,
        month,
      }),
    [visible, visibleInvoices, balanceViews, expandedDayKey, month],
  );

  // The first load of a filter shows skeleton rows; later loads keep the previous result visible.
  const filtersLoading =
    filtering &&
    ((showAccountRows &&
      filteredTransactions.isFetching &&
      !keptFilteredItems) ||
      (showCards && filteredInvoices.isFetching && !keptFilteredInvoices));
  const filtersError = filtering
    ? (filteredTransactions.error ?? filteredInvoices.error)
    : null;

  function onMonthSelect(monthIndex: string) {
    setMonth(new Date(pickerYear, Number(monthIndex), 1));
    setMonthPickerOpen(false);
  }

  function onMonthPickerOpen() {
    setPickerYear(month.getFullYear());
    setMonthPickerOpen(true);
  }

  function onRefresh() {
    if (filtering) {
      refetchFiltered();
    }
    transactions.refetch();
    invoices.refetch();
    summary.refetch();
    if (balancesEnabled) {
      balances.refetch();
    }
    if (isFutureMonth) {
      projections.refetch();
    }
  }

  return {
    allOwnerIds,
    archivedOwnerIds: archivedIds,
    balances: balanceViews ?? new Map<string, DayBalanceView>(),
    entries,
    errorMessage: transactions.error?.message,
    expandedDayKey,
    expandedInvoiceId,
    filterCount: activeGroups(filterStore.filters).length,
    filteredSummary,
    filtering,
    filters: filterStore.filters,
    filtersEmpty: filtering && !filtersLoading && entries.length === 0,
    filtersError: filtersError?.message,
    filtersLoading,
    hasPeriod: !!applied.period,
    invoicesError: !!invoices.error,
    isEmptyMonth:
      !filtering &&
      scopedItemsOfMonth.length === 0 &&
      invoicesOfMonth.length === 0,
    isFilteredEmpty:
      !filtering &&
      scopedItemsOfMonth.length + invoicesOfMonth.length > 0 &&
      entries.length === 0,
    isLoading: transactions.isFetching && !transactions.data,
    isMonthPickerOpen,
    isRefreshing: transactions.isFetching && !!transactions.data,
    languageTag,
    monthChoices: monthChoices(languageTag),
    monthLabel: formatMonthLabel(month, languageTag),
    monthName: formatMonthName(month, languageTag),
    onAddPress: scope.guard(() =>
      // Spec 050: the form starts with the scope owner (All leaves its default).
      openModal(
        "add_new_transaction",
        ownerFilter === ALL_FILTER ? undefined : { ownerId: ownerFilter },
      ),
    ),
    onClearFilters: () => {
      setOwnerSelection(ALL_FILTER);
      setTypeFilter("ALL");
      filterStore.clearAll();
    },
    onDayToggle: (dateKey: string) =>
      setExpandedDayKey((current) =>
        current === dateKey ? undefined : dateKey,
      ),
    onFilterRemove: filterStore.removeGroup,
    onFiltersApply: filterStore.replace,
    onFiltersClear: filterStore.clearAll,
    onInvoiceOpen: scope.guard((invoice: CardInvoiceUIModel) =>
      openModal("invoice_detail", {
        cardId: invoice.cardId,
        month: invoice.referenceMonth,
      }),
    ),
    onInvoiceRetry: async () => invoices.refetch(),
    onInvoiceToggle: (id: string) =>
      setExpandedInvoiceId((current) => (current === id ? undefined : id)),
    onMonthPickerClose: () => setMonthPickerOpen(false),
    onMonthPickerOpen,
    onMonthSelect,
    onNextMonth: () => setMonth((current) => shiftMonth(current, 1)),
    onOwnerFilterChange: setOwnerSelection,
    onPickerYearChange: (delta: number) =>
      setPickerYear((year) => year + delta),
    onPreviousMonth: () => setMonth((current) => shiftMonth(current, -1)),
    onProjectedPress: scope.guard((item: TransactionUIModel) =>
      openModal("add_new_transaction", {
        month: item.monthKey,
        occurrenceNumber: String(item.occurrenceNumber),
        recurrenceId: item.recurrenceId,
      }),
    ),
    onReadOnlyAttempt: scope.notifyReadOnly,
    onRefresh,
    onRetry: async () => transactions.refetch(),
    onRowPress: scope.guard((id: string) =>
      openModal("add_new_transaction", { id }),
    ),
    onSearchChange: filterStore.setSearch,
    onSummaryRetry: async () => summary.refetch(),
    onToastHide: scope.onToastHide,
    onTypeFilterChange: (value: string) => setTypeFilter(value as TypeFilter),
    ownerFilter,
    owners: owners ?? [],
    personalOwnerId: findPersonalOwnerId(owners ?? []),
    pickerYear,
    readOnly: scope.readOnly,
    scopeChoices: buildOwnerFilterChoices(owners ?? []),
    scopeOwnerIds: summaryOwnerIds,
    selectedMonthIndex:
      pickerYear === month.getFullYear() ? String(month.getMonth()) : undefined,
    stickyIndices: stickyIndices(entries),
    summary: summary.data
      ? {
          balanceCents: summary.data.balance,
          expenseCents: summary.data.expense,
          incomeCents: summary.data.income,
          projectedExpenseCents: summary.data.projectedExpense ?? 0,
          projectedIncomeCents: summary.data.projectedIncome ?? 0,
          toPayCents: summary.data.toPay,
          toReceiveCents: summary.data.toReceive,
        }
      : undefined,
    summaryError: !!summary.error,
    toastVisible: scope.toastVisible,
    typeFilter,
  };
}

export type { TransactionsData };
export {
  fetchFilteredTransactions,
  fetchProjections,
  fetchSummary,
  fetchTransactions,
};
export default useTransactionsViewModel;
