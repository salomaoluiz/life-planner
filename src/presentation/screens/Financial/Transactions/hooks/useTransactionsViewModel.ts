import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { MonthSummary } from "@application/dto/home/MonthSummaryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import useTranslationLocale from "@presentation/i18n/useTranslationLocale";
import {
  buildOwnerChoices,
  ChoiceOption,
} from "@screens/Financial/models/ownerOptions";

import {
  ALL_FILTER,
  applyFilter,
  buildEntries,
  formatMonthLabel,
  isInMonth,
  monthChoices,
  ownerFilter,
  shiftMonth,
  startOfMonth,
  stickyIndices,
} from "../models/transactionList";
import TransactionUIModel from "../models/TransactionUIModel";

interface TransactionsData {
  items: TransactionUIModel[];
  owners: OwnerDTO[];
}

function buildFilterChoices(owners: OwnerDTO[]): ChoiceOption[] {
  return [
    { labelKey: "financial.common.all", value: ALL_FILTER },
    { labelKey: "financial.common.expenses", value: "EXPENSE" },
    { labelKey: "financial.common.incomes", value: "INCOME" },
    ...buildOwnerChoices(owners).map((choice) => ({
      ...choice,
      value: ownerFilter(choice.value),
    })),
  ];
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

function useTransactionsViewModel() {
  const isFocused = useIsFocused();
  const { getLocale } = useTranslationLocale();
  const languageTag = getLocale().languageTag ?? "en-US";

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [filter, setFilter] = useState(ALL_FILTER);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(month.getFullYear());

  const transactions = useQuery<TransactionsData>({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    fetch: fetchTransactions,
  });

  const owners = transactions.data?.owners;
  const summaryOwnerIds = useMemo(() => {
    if (filter.startsWith("OWNER:")) {
      return [filter.slice("OWNER:".length)];
    }

    return (owners ?? []).map((owner) => owner.id);
  }, [filter, owners]);

  const summary = useQuery<MonthSummary>({
    cacheKey: [
      useCases.getMonthSummaryUseCase.uniqueName,
      `${month.getFullYear()}-${month.getMonth()}`,
      ...summaryOwnerIds,
    ],
    enabled: !!owners,
    fetch: async () => fetchSummary(month, summaryOwnerIds),
  });

  useEffect(() => {
    if (isFocused) {
      transactions.refetch();
      summary.refetch();
    }
  }, [isFocused]);

  const itemsOfMonth = useMemo(
    () =>
      (transactions.data?.items ?? []).filter((item) =>
        isInMonth(item.date, month),
      ),
    [transactions.data, month],
  );
  const visible = useMemo(
    () => applyFilter(itemsOfMonth, filter),
    [itemsOfMonth, filter],
  );
  const entries = useMemo(() => buildEntries(visible, new Date()), [visible]);

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
    summary.refetch();
  }

  return {
    entries,
    errorMessage: transactions.error?.message,
    filter,
    filterChoices: buildFilterChoices(owners ?? []),
    isEmptyMonth: itemsOfMonth.length === 0,
    isFilteredEmpty: itemsOfMonth.length > 0 && visible.length === 0,
    isLoading: transactions.isFetching && !transactions.data,
    isMonthPickerOpen,
    isRefreshing: transactions.isFetching && !!transactions.data,
    languageTag,
    monthChoices: monthChoices(languageTag),
    monthLabel: formatMonthLabel(month, languageTag),
    onAddPress: () =>
      router.push({ pathname: "/financial/transaction/add_new_transaction" }),
    onClearFilters: () => setFilter(ALL_FILTER),
    onFilterChange: setFilter,
    onMonthPickerClose: () => setMonthPickerOpen(false),
    onMonthPickerOpen,
    onMonthSelect,
    onNextMonth: () => setMonth((current) => shiftMonth(current, 1)),
    onPickerYearChange: (delta: number) =>
      setPickerYear((year) => year + delta),
    onPreviousMonth: () => setMonth((current) => shiftMonth(current, -1)),
    onRefresh,
    onRetry: async () => transactions.refetch(),
    onRowPress: (id: string) =>
      router.push({
        params: { id },
        pathname: "/financial/transaction/add_new_transaction",
      }),
    onSummaryRetry: async () => summary.refetch(),
    pickerYear,
    selectedMonthIndex:
      pickerYear === month.getFullYear() ? String(month.getMonth()) : undefined,
    stickyIndices: stickyIndices(entries),
    summary: summary.data
      ? {
          balanceCents: summary.data.balance,
          expenseCents: summary.data.expense,
          incomeCents: summary.data.income,
        }
      : undefined,
    summaryError: !!summary.error,
  };
}

export { fetchSummary, fetchTransactions };
export default useTransactionsViewModel;
