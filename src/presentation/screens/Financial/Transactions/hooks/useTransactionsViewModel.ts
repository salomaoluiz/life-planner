import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { MonthSummary } from "@application/dto/home/MonthSummaryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import useTranslationLocale from "@presentation/i18n/useTranslationLocale";
import { addMonthsTo } from "@screens/Financial/models/invoiceMonth";
import {
  buildOwnerFilterChoices,
  personalOwnerId as findPersonalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import { listQueryKey } from "@screens/Financial/models/queryKeys";

import CardInvoiceUIModel from "../models/CardInvoiceUIModel";
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

// Balances exist up to this many months after the current one (spec 035 FR 10).
const MAX_BALANCE_MONTHS_AHEAD = 12;

// What the API projects for the months after the current one (spec 034 FR 14).
interface ProjectedData {
  accountItems: TransactionUIModel[];
  cardGroups: ProjectedInvoiceGroup[];
}

interface TransactionsData {
  items: TransactionUIModel[];
  owners: OwnerDTO[];
}

async function fetchProjections(
  from: string,
  to: string,
  ownerIds: string[],
): Promise<ProjectedData> {
  const [items, categories] = await Promise.all([
    useCases.getFinancialProjectionsUseCase.execute({ from, ownerIds, to }),
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
      ownerFilter === ALL_FILTER
        ? (owners ?? []).map((owner) => owner.id)
        : [ownerFilter],
    [ownerFilter, owners],
  );

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

  const summary = useQuery<MonthSummary>({
    cacheKey: [
      useCases.getMonthSummaryUseCase.uniqueName,
      `${month.getFullYear()}-${month.getMonth()}`,
      ...summaryOwnerIds,
    ],
    enabled: !!owners,
    fetch: async () => fetchSummary(month, summaryOwnerIds),
  });

  // A new month or scope shows other days: nothing stays expanded.
  useEffect(() => {
    setExpandedDayKey(undefined);
  }, [monthKey, ownerFilter]);

  useEffect(() => {
    if (isFocused) {
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
  }, [isFocused]);

  const itemsOfMonth = useMemo(
    () => [
      ...(transactions.data?.items ?? []).filter(
        (item) => !item.isCardPurchase && isInMonth(item.date, month),
      ),
      ...(isFutureMonth ? (projections.data?.accountItems ?? []) : []).filter(
        (item) => isInMonth(item.date, month),
      ),
    ],
    [transactions.data, projections.data, month, isFutureMonth],
  );
  // Real invoices of the month carrying their projections, plus the invoices that only exist as projections.
  const allInvoices = useMemo(
    () =>
      mergeProjectedInvoices(
        invoices.data ?? [],
        isFutureMonth
          ? (projections.data?.cardGroups ?? []).filter(
              (group) => group.listDate.slice(0, 7) === monthKey,
            )
          : [],
      ),
    [invoices.data, projections.data, monthKey, isFutureMonth],
  );
  const visible = useMemo(
    () => filterByType(filterByOwner(itemsOfMonth, ownerFilter), typeFilter),
    [itemsOfMonth, ownerFilter, typeFilter],
  );
  const invoicesOfMonth = allInvoices;
  const visibleInvoices = useMemo(
    () =>
      filterInvoicesByType(
        filterInvoicesByOwner(allInvoices, ownerFilter),
        typeFilter,
      ),
    [allInvoices, ownerFilter, typeFilter],
  );
  const balanceViews = useMemo(
    () => (balances.error ? undefined : balances.data),
    [balances.data, balances.error],
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

  function onMonthSelect(monthIndex: string) {
    setMonth(new Date(pickerYear, Number(monthIndex), 1));
    setMonthPickerOpen(false);
  }

  function onMonthPickerOpen() {
    setPickerYear(month.getFullYear());
    setMonthPickerOpen(true);
  }

  function onRefresh() {
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
    balances: balanceViews ?? new Map<string, DayBalanceView>(),
    entries,
    errorMessage: transactions.error?.message,
    expandedDayKey,
    expandedInvoiceId,
    invoicesError: !!invoices.error,
    isEmptyMonth: itemsOfMonth.length === 0 && invoicesOfMonth.length === 0,
    isFilteredEmpty:
      itemsOfMonth.length + invoicesOfMonth.length > 0 && entries.length === 0,
    isLoading: transactions.isFetching && !transactions.data,
    isMonthPickerOpen,
    isRefreshing: transactions.isFetching && !!transactions.data,
    languageTag,
    monthChoices: monthChoices(languageTag),
    monthLabel: formatMonthLabel(month, languageTag),
    monthName: formatMonthName(month, languageTag),
    onAddPress: () =>
      router.push({ pathname: "/financial/transaction/add_new_transaction" }),
    onClearFilters: () => {
      setOwnerSelection(ALL_FILTER);
      setTypeFilter("ALL");
    },
    onDayToggle: (dateKey: string) =>
      setExpandedDayKey((current) =>
        current === dateKey ? undefined : dateKey,
      ),
    onInvoiceOpen: (invoice: CardInvoiceUIModel) =>
      router.push({
        params: { cardId: invoice.cardId, month: invoice.referenceMonth },
        pathname: "/financial/invoice/invoice_detail",
      } as never),
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
    onProjectedPress: (item: TransactionUIModel) =>
      router.push({
        params: {
          month: item.monthKey,
          occurrenceNumber: String(item.occurrenceNumber),
          recurrenceId: item.recurrenceId,
        },
        pathname: "/financial/transaction/add_new_transaction",
      } as never),
    onRefresh,
    onRetry: async () => transactions.refetch(),
    onRowPress: (id: string) =>
      router.push({
        params: { id },
        pathname: "/financial/transaction/add_new_transaction",
      }),
    onSummaryRetry: async () => summary.refetch(),
    onTypeFilterChange: (value: string) => setTypeFilter(value as TypeFilter),
    ownerFilter,
    personalOwnerId: findPersonalOwnerId(owners ?? []),
    pickerYear,
    scopeChoices: buildOwnerFilterChoices(owners ?? []),
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
    typeFilter,
  };
}

export { fetchProjections, fetchSummary, fetchTransactions };
export default useTransactionsViewModel;
