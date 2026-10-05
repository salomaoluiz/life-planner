import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import RecentTransactionDTO from "@application/dto/home/RecentTransactionDTO";
import StockAttentionDTO from "@application/dto/home/StockAttentionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import UserDTO from "@application/dto/user/UserDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";

import HomeHeaderUIModel from "../models/HomeHeaderUIModel";
import MonthSummaryUIModel from "../models/MonthSummaryUIModel";
import {
  buildOwnerFilterOptions,
  normalizeSelection,
  resolveOwnerIds,
} from "../models/ownerFilter";
import RecentTransactionUIModel from "../models/RecentTransactionUIModel";
import StockAttentionUIModel from "../models/StockAttentionUIModel";
import { useHomeOwnerFilter } from "./homeOwnerFilterStore";

export interface BlockState<T> {
  data?: T;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
}

async function fetchOwners() {
  return useCases.getOwnersUseCase.execute();
}

async function fetchStock(ownerIds: string[]) {
  return useCases.getStockAttentionUseCase.execute({ ownerIds });
}

async function fetchSummary(ownerIds: string[], month: Date) {
  return useCases.getMonthSummaryUseCase.execute({ month, ownerIds });
}

async function fetchTransactions(ownerIds: string[]) {
  return useCases.getRecentTransactionsUseCase.execute({ ownerIds });
}

async function fetchUser() {
  return useCases.getUserUseCase.execute();
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toBlock<D, U>(
  query: { data?: D; error: unknown; refetch: () => unknown },
  ownersFailed: boolean,
  onOwnersRetry: () => unknown,
  build: (data: D) => U,
): BlockState<U> {
  const data = query.data;
  const isError = ownersFailed || (!!query.error && !data);

  return {
    data: data && !ownersFailed ? build(data) : undefined,
    isError,
    isLoading: !isError && !data,
    onRetry: () => {
      if (ownersFailed) {
        onOwnersRetry();
      } else {
        query.refetch();
      }
    },
  };
}

function useHomeViewModel() {
  const isFocused = useIsFocused();
  const breakpoint = useBreakpoint();
  const { getLocale } = useTranslationLocale();
  const { languageTag } = getLocale();
  const [storedSelection, setSelection] = useHomeOwnerFilter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const now = new Date();

  const owners = useQuery<OwnerDTO[]>({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: fetchOwners,
  });
  const user = useQuery<UserDTO>({
    cacheKey: [useCases.getUserUseCase.uniqueName],
    fetch: fetchUser,
  });

  const ownerList = owners.data ?? [];
  const selection = normalizeSelection(ownerList, storedSelection);
  const ownerIds = resolveOwnerIds(ownerList, selection);
  const ownersReady = !!owners.data;
  const ownersKey = ownerIds.join(",");

  const summary = useQuery<MonthSummaryDTO>({
    cacheKey: [
      useCases.getMonthSummaryUseCase.uniqueName,
      ownersKey,
      monthKey(now),
    ],
    enabled: ownersReady,
    fetch: async () => fetchSummary(ownerIds, now),
  });
  const stock = useQuery<StockAttentionDTO>({
    cacheKey: [useCases.getStockAttentionUseCase.uniqueName, ownersKey],
    enabled: ownersReady,
    fetch: async () => fetchStock(ownerIds),
  });
  const transactions = useQuery<RecentTransactionDTO[]>({
    cacheKey: [useCases.getRecentTransactionsUseCase.uniqueName, ownersKey],
    enabled: ownersReady,
    fetch: async () => fetchTransactions(ownerIds),
  });

  async function refetchAll() {
    await Promise.all([
      owners.refetch(),
      user.refetch(),
      ...(ownersReady
        ? [summary.refetch(), stock.refetch(), transactions.refetch()]
        : []),
    ]);
  }

  useEffect(() => {
    if (isFocused) {
      refetchAll();
    }
  }, [isFocused]);

  async function onRefresh() {
    setIsRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setIsRefreshing(false);
    }
  }

  const ownersFailed = !!owners.error && !ownersReady;
  const summaryState = toBlock(
    summary,
    ownersFailed,
    owners.refetch,
    (dto) => new MonthSummaryUIModel(dto, now, languageTag),
  );
  const stockState = toBlock(
    stock,
    ownersFailed,
    owners.refetch,
    (dto) => new StockAttentionUIModel(dto, ownerList),
  );
  const transactionsState = toBlock(
    transactions,
    ownersFailed,
    owners.refetch,
    (dtos) =>
      dtos.map((dto) => new RecentTransactionUIModel(dto, now, languageTag)),
  );

  function push(
    path: string | { params: Record<string, string>; pathname: string },
  ) {
    router.push(path as never);
  }

  return {
    filter: {
      onChange: setSelection,
      options: buildOwnerFilterOptions(ownerList),
      value: selection,
    },
    header: new HomeHeaderUIModel(user.data, now, languageTag),
    isRefreshing,
    isSplitLayout: breakpoint === "expanded",
    onAddStockItemPress: () => push("/stock/add_new_stock_item"),
    onAddTransactionPress: () =>
      push("/financial/transaction/add_new_transaction"),
    onRefresh,
    onStockSeeAllPress: () =>
      push({ params: { filter: "EXPIRING" }, pathname: "/stock" }),
    onSummaryPress: () => push("/financial"),
    onTransactionsSeeAllPress: () => push("/financial"),
    stock: stockState,
    summary: summaryState,
    transactions: transactionsState,
  };
}

export default useHomeViewModel;
