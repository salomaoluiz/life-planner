import { useIsFocused } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";
import { refetchStaleFetcherData, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import useStableCallback from "@presentation/hooks/useStableCallback";
import useTranslationLocale from "@presentation/i18n/useTranslationLocale";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import { addMonthsTo } from "@screens/Financial/models/invoiceMonth";
import {
  activeOwnerIds,
  archivedOwnerIds,
  buildOwnerFilterChoices,
  personalOwnerId as findPersonalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import CardInvoiceUIModel from "../models/CardInvoiceUIModel";
import {
  applyPendingToInvoices,
  applyPendingToItems,
} from "../models/pendingRows";
import {
  activeGroups,
  effectiveRange,
  isFiltering,
  matchesPendingFilters,
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
import { MonthData, ProjectedData } from "../models/transactionsData";
import TransactionUIModel from "../models/TransactionUIModel";
import { hasPendingChanges } from "../pending/pendingChanges";
import { usePendingChanges } from "../pending/usePendingChanges";
import { consumePendingNavigation } from "./pendingNavigation";
import usePrefetchAdjacentMonths from "./usePrefetchAdjacentMonths";
import useTransactionFilters from "./useTransactionFilters";

// The projections endpoint answers at most this many months.
const MAX_PROJECTION_MONTHS = 12;

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

// Spec 080: one request brings the rows, invoices, balances, projections and summary of the month, for the owners of
// the scope on screen. Only the month on screen is downloaded, never the whole history (spec 075).
async function fetchMonth(
  allOwnerIds: string[],
  monthKey: string,
  scopeOwnerIds: string[],
): Promise<MonthData> {
  const [month, categories] = await Promise.all([
    useCases.getFinancialMonthUseCase.execute({
      month: monthKey,
      ownerIds: scopeOwnerIds,
    }),
    useCases.getFinancialCategoriesUseCase.execute(allOwnerIds),
  ]);
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  return {
    balances: toDayBalanceViews(month.dailyBalances),
    categories,
    invoices: month.invoices.map((invoice) => new CardInvoiceUIModel(invoice)),
    items: month.items.map(
      (transaction) =>
        new TransactionUIModel(
          transaction,
          categoryById.get(transaction.categoryId),
        ),
    ),
    projections: toProjectedData(month.projections, categories),
    summary: {
      ...month.summary,
      balance: month.summary.income - month.summary.expense,
    },
  };
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

  return toProjectedData(items, categories);
}

// The later of two `YYYY-MM` keys.
function maxMonth(a: string, b: string) {
  return a > b ? a : b;
}

// The cache key of one month's query. The screen's query and the prefetch of the neighbouring months (spec 087) both
// use it, so a prefetched month is found on a switch; `useOwnerScopedQuery` appends the owner ids, which the
// prefetch passes itself.
function monthCacheKey(
  monthKey: string,
  scopeOwnerIds: string[],
  allOwnerIds: string[] = [],
) {
  return [
    ...financeKeys.transactions.list(),
    monthKey,
    scopeOwnerIds.join(","),
    ...allOwnerIds,
  ];
}

// `YYYY-MM` of the local month.
function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Account projections as rows; card projections grouped by the invoice they would land on.
function toProjectedData(
  items: ProjectedOccurrenceDTO[],
  categories: CategoryDTO[],
): ProjectedData {
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

  // Owners come from the shared query: the month query starts as soon as they are known (spec 074).
  const owners = useOwners().data;
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
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
  // Spec 080: the rows, invoices, balances, projections and summary of the month come from ONE request, keyed by the
  // month and the scope (spec 075); another key keeps the previous data flagged as placeholder until its own arrives,
  // and the edit form and the description suggestions read these cached months.
  const monthQuery = useOwnerScopedQuery<MonthData>({
    cacheKey: monthCacheKey(monthKey, summaryOwnerIds),
    fetch: async (loadedOwners) =>
      fetchMonth(
        loadedOwners.map((owner) => owner.id),
        monthKey,
        summaryOwnerIds,
      ),
    keepPreviousData: true,
  });
  // The month's own data is not here yet (first load, or another month showing the previous one meanwhile).
  const isListPending = !monthQuery.data || !!monthQuery.isPlaceholderData;
  // Only the rows may show while the month's own data loads; the invoices, balances and summary never do.
  const monthData = monthQuery.isPlaceholderData ? undefined : monthQuery.data;

  const archivedIds = useMemo(() => archivedOwnerIds(owners ?? []), [owners]);
  const scope = useReadOnlyScope(owners, ownerFilter);
  const { openModal } = useModalNavigation();

  const allOwnerIds = useMemo(
    () => (owners ?? []).map((owner) => owner.id),
    [owners],
  );
  // Months after the current one also show what the series will create (the month response carries them).
  const currentMonthKey = toMonthKey(new Date());
  const isFutureMonth = monthKey > currentMonthKey;
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string>();
  const [expandedDayKey, setExpandedDayKey] = useState<string>();

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
      ...financeKeys.transactionsFiltered.list(),
      filterKey,
      ...allOwnerIds,
    ],
    enabled: !!owners && filtering && showAccountRows,
    fetch: async () => fetchFilteredTransactions(allOwnerIds, queryFilter),
  });
  const filteredInvoices = useQuery<CardInvoiceUIModel[]>({
    cacheKey: [
      ...financeKeys.invoices.list(),
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
      ...financeKeys.projections.list(),
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

  // Key prefixes of every query this screen shows (the month and the filtered variants).
  const focusCacheKeys = [
    financeKeys.transactions.list(),
    financeKeys.invoices.list(),
    financeKeys.projections.list(),
    financeKeys.transactionsFiltered.list(),
  ];

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
      // Returning to the screen only refreshes what went stale; disabled queries are skipped by the helper.
      refetchStaleFetcherData(focusCacheKeys);
    }
  }, [isFocused]);

  function inRange(dateKey: string) {
    return dateKey >= range.from && dateKey <= range.to;
  }
  const pendingChanges = usePendingChanges();
  const pendingContext = useMemo(
    () => ({
      categoryById: new Map(
        (monthQuery.data?.categories ?? []).map((category) => [
          category.id,
          category,
        ]),
      ),
      matches: (row: TransactionDTO) => {
        const date = new Date(row.date);

        return filtering
          ? matchesPendingFilters(row, applied) && inRange(toDateKey(date))
          : isInMonth(date, month);
      },
    }),
    [monthQuery.data, filtering, applied, month, range],
  );
  const loadedItemsOfMonth = useMemo(
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
            ...(monthQuery.data?.items ?? []).filter(
              (item) => !item.isCardPurchase && isInMonth(item.date, month),
            ),
            ...(isFutureMonth
              ? (monthData?.projections.accountItems ?? [])
              : []
            ).filter((item) => isInMonth(item.date, month)),
          ],
    [
      monthQuery.data,
      monthData,
      month,
      isFutureMonth,
      filtering,
      showAccountRows,
      keptFilteredItems,
      keptFilteredProjections,
      range,
    ],
  );
  const itemsOfMonth = useMemo(
    () =>
      applyPendingToItems(loadedItemsOfMonth, pendingChanges, pendingContext),
    [loadedItemsOfMonth, pendingChanges, pendingContext],
  );
  // Real invoices of the month carrying their projections, plus the invoices that only exist as projections.
  const loadedInvoices = useMemo(
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
            monthData?.invoices ?? [],
            isFutureMonth
              ? (monthData?.projections.cardGroups ?? []).filter(
                  (group) => group.listDate.slice(0, 7) === monthKey,
                )
              : [],
          ),
    [
      monthData,
      monthKey,
      isFutureMonth,
      filtering,
      showCards,
      keptFilteredInvoices,
      keptFilteredProjections,
      range,
    ],
  );
  const allInvoices = useMemo(
    () =>
      applyPendingToInvoices(loadedInvoices, pendingChanges, pendingContext),
    [loadedInvoices, pendingChanges, pendingContext],
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
    () => (filtering ? undefined : monthData?.balances),
    [monthData, filtering],
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

  // Spec 087: once the month is settled and the app idle, the previous and next month are fetched into the cache.
  usePrefetchAdjacentMonths({
    cacheKey: (key) => monthCacheKey(key, summaryOwnerIds, allOwnerIds),
    enabled:
      isFocused &&
      !!monthData &&
      !monthQuery.isFetching &&
      !filtering &&
      !hasPendingChanges(pendingChanges),
    fetch: async (key) => fetchMonth(allOwnerIds, key, summaryOwnerIds),
    monthKeys: [
      toMonthKey(shiftMonth(month, -1)),
      toMonthKey(shiftMonth(month, 1)),
    ],
  });

  // Spec 087: handlers handed to the memoized rows keep their identity; each call reads the latest scope.
  const onInvoiceOpen = useStableCallback(
    scope.guard((invoice: CardInvoiceUIModel) =>
      openModal("invoice_detail", {
        cardId: invoice.cardId,
        month: invoice.referenceMonth,
      }),
    ),
  );
  const onInvoiceToggle = useStableCallback((id: string) =>
    setExpandedInvoiceId((current) => (current === id ? undefined : id)),
  );
  const onProjectedPress = useStableCallback(
    scope.guard((item: TransactionUIModel) =>
      openModal("add_new_transaction", {
        month: item.monthKey,
        occurrenceNumber: String(item.occurrenceNumber),
        recurrenceId: item.recurrenceId,
      }),
    ),
  );
  const onReadOnlyAttempt = useStableCallback(scope.notifyReadOnly);
  const onRowPress = useStableCallback(
    scope.guard((id: string) => openModal("add_new_transaction", { id })),
  );

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
    monthQuery.refetch();
  }

  return {
    allOwnerIds,
    archivedOwnerIds: archivedIds,
    balances: balanceViews ?? new Map<string, DayBalanceView>(),
    entries,
    errorMessage: monthQuery.error?.message,
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
    invoicesError: !!monthQuery.error,
    isEmptyMonth:
      !filtering &&
      scopedItemsOfMonth.length === 0 &&
      invoicesOfMonth.length === 0,
    isFilteredEmpty:
      !filtering &&
      scopedItemsOfMonth.length + invoicesOfMonth.length > 0 &&
      entries.length === 0,
    isLoading: isListPending && !monthQuery.error,
    isMonthPickerOpen,
    isRefreshing: monthQuery.isFetching && !isListPending,
    isTotalsUpdating: hasPendingChanges(pendingChanges),
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
    onInvoiceOpen,
    onInvoiceRetry: async () => monthQuery.refetch(),
    onInvoiceToggle,
    onMonthPickerClose: () => setMonthPickerOpen(false),
    onMonthPickerOpen,
    onMonthSelect,
    onNextMonth: () => setMonth((current) => shiftMonth(current, 1)),
    onOwnerFilterChange: setOwnerSelection,
    onPickerYearChange: (delta: number) =>
      setPickerYear((year) => year + delta),
    onPreviousMonth: () => setMonth((current) => shiftMonth(current, -1)),
    onProjectedPress,
    onReadOnlyAttempt,
    onRefresh,
    onRetry: async () => monthQuery.refetch(),
    onRowPress,
    onSearchChange: filterStore.setSearch,
    onSummaryRetry: async () => monthQuery.refetch(),
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
    summary: monthData
      ? {
          balanceCents: monthData.summary.balance,
          expenseCents: monthData.summary.expense,
          incomeCents: monthData.summary.income,
          projectedExpenseCents: monthData.summary.projectedExpense ?? 0,
          projectedIncomeCents: monthData.summary.projectedIncome ?? 0,
          toPayCents: monthData.summary.toPay,
          toReceiveCents: monthData.summary.toReceive,
        }
      : undefined,
    summaryError: !!monthQuery.error,
    toastVisible: scope.toastVisible,
    typeFilter,
  };
}

export {
  fetchFilteredTransactions,
  fetchMonth,
  fetchProjections,
  monthCacheKey,
};
export default useTransactionsViewModel;
