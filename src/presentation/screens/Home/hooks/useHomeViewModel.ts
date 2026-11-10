import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import StockAttentionDTO from "@application/dto/home/StockAttentionDTO";
import UpcomingDTO, {
  UpcomingItemDTO,
} from "@application/dto/home/UpcomingDTO";
import UserDTO from "@application/dto/user/UserDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { resolveFavoriteAccount } from "@domain/entities/financial/resolveFavoriteAccount";
import { refetchStaleFetcherData, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { useTranslationLocale } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import useScreenCurrency from "@screens/Financial/hooks/useScreenCurrency";
import { setTransactionFilters } from "@screens/Financial/Transactions/hooks/useTransactionFilters";
import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import FinanceBalanceUIModel from "../models/FinanceBalanceUIModel";
import HomeHeaderUIModel from "../models/HomeHeaderUIModel";
import LowestBalanceUIModel from "../models/LowestBalanceUIModel";
import {
  buildOwnerFilterOptions,
  normalizeSelection,
  resolveOwnerIds,
} from "../models/ownerFilter";
import StockAttentionUIModel from "../models/StockAttentionUIModel";
import UpcomingUIModel from "../models/UpcomingUIModel";
import { useHomeOwnerFilter } from "./homeOwnerFilterStore";

export interface BlockState<T> {
  data?: T;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
}

export type HomeVM = ReturnType<typeof useHomeViewModel>;

// A block that needs several queries: loading until all arrive, an error when any fails with nothing to show.
function combineBlocks<U>(
  queries: { data?: unknown; error: unknown; refetch: () => unknown }[],
  ownersFailed: boolean,
  onOwnersRetry: () => unknown,
  build: () => U,
): BlockState<U> {
  const ready = queries.every((query) => !!query.data);
  const isError =
    ownersFailed || (!ready && queries.some((query) => !!query.error));

  return {
    data: ready && !ownersFailed ? build() : undefined,
    isError,
    isLoading: !isError && !ready,
    onRetry: () => {
      if (ownersFailed) {
        onOwnersRetry();
      } else {
        queries.forEach((query) => query.refetch());
      }
    },
  };
}

async function fetchAccounts(ownerIds: string[]) {
  return useCases.getFinancialAccountsUseCase.execute(ownerIds);
}

async function fetchBalances(
  ownerIds: string[],
  month: string,
  currency: CurrencyCode,
) {
  return useCases.getFinancialDailyBalancesUseCase.execute({
    currency,
    month,
    ownerIds,
  });
}

async function fetchStock(ownerIds: string[]) {
  return useCases.getStockAttentionUseCase.execute({ ownerIds });
}

async function fetchSummary(
  ownerIds: string[],
  month: Date,
  currency: CurrencyCode,
) {
  return useCases.getMonthSummaryUseCase.execute({
    currency,
    month,
    ownerIds,
  });
}

async function fetchUpcoming(ownerIds: string[]) {
  return useCases.getUpcomingItemsUseCase.execute({ ownerIds });
}

async function fetchUser() {
  return useCases.getUserUseCase.execute();
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// The first and last day (`YYYY-MM-DD`) of the month of a `YYYY-MM-DD` date.
function monthPeriod(dateKey: string) {
  const [year, month] = dateKey.split("-").map(Number);
  const last = new Date(year, month, 0).getDate();
  const key = dateKey.slice(0, 7);

  return { from: `${key}-01`, to: `${key}-${String(last).padStart(2, "0")}` };
}

function nextMonthKey(date: Date) {
  return monthKey(new Date(date.getFullYear(), date.getMonth() + 1, 1));
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

export default useHomeViewModel;

function useHomeViewModel() {
  const isFocused = useIsFocused();
  const breakpoint = useBreakpoint();
  const { getLocale } = useTranslationLocale();
  const { languageTag } = getLocale();
  const [storedSelection, setSelection] = useHomeOwnerFilter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const now = new Date();

  const owners = useOwners();
  const user = useQuery<UserDTO>({
    cacheKey: [useCases.getUserUseCase.uniqueName],
    fetch: fetchUser,
    // The profile changes only through the user's own edits, which update it: never stale on its own.
    staleTime: Infinity,
  });

  const ownerList = owners.data ?? [];
  const selection = normalizeSelection(ownerList, storedSelection);
  const ownerIds = resolveOwnerIds(ownerList, selection);
  const ownersReady = !!owners.data;
  const ownersKey = ownerIds.join(",");

  const accounts = useQuery<AccountDTO[]>({
    cacheKey: financeKeys.accounts.raw(ownersKey),
    enabled: ownersReady,
    fetch: async () => fetchAccounts(ownerIds),
  });
  // Spec 103: one currency at a time; the dropdown only exists with active accounts in more than one currency.
  const screenCurrency = useScreenCurrency(accounts.data ?? []);
  const currency = screenCurrency.currency;

  const summary = useQuery<MonthSummaryDTO>({
    cacheKey: [
      ...financeKeys.summary.ofMonth(monthKey(now), "home"),
      ownersKey,
      currency,
    ],
    enabled: ownersReady,
    fetch: async () => fetchSummary(ownerIds, now, currency),
  });
  const stock = useQuery<StockAttentionDTO>({
    cacheKey: [useCases.getStockAttentionUseCase.uniqueName, ownersKey],
    enabled: ownersReady,
    fetch: async () => fetchStock(ownerIds),
  });
  const balancesNow = useQuery<DailyBalanceDTO>({
    cacheKey: [
      ...financeKeys.dailyBalances.ofMonth(monthKey(now), "home"),
      ownersKey,
      currency,
    ],
    enabled: ownersReady,
    fetch: async () => fetchBalances(ownerIds, monthKey(now), currency),
  });
  const balancesNext = useQuery<DailyBalanceDTO>({
    cacheKey: [
      ...financeKeys.dailyBalances.ofMonth(nextMonthKey(now), "home"),
      ownersKey,
      currency,
    ],
    enabled: ownersReady,
    fetch: async () => fetchBalances(ownerIds, nextMonthKey(now), currency),
  });
  const upcoming = useQuery<UpcomingDTO>({
    cacheKey: financeKeys.upcoming.raw(ownersKey),
    enabled: ownersReady,
    fetch: async () => fetchUpcoming(ownerIds),
  });

  async function refetchAll() {
    await Promise.all([
      owners.refetch(),
      user.refetch(),
      ...(ownersReady
        ? [
            summary.refetch(),
            stock.refetch(),
            accounts.refetch(),
            balancesNow.refetch(),
            balancesNext.refetch(),
            upcoming.refetch(),
          ]
        : []),
    ]);
  }

  // Returning to Home only refreshes what went stale (the profile never does; disabled queries are skipped).
  useEffect(() => {
    if (isFocused) {
      refetchStaleFetcherData([
        [useCases.getOwnersUseCase.uniqueName],
        financeKeys.summary.all(),
        [useCases.getStockAttentionUseCase.uniqueName],
        financeKeys.accounts.all(),
        financeKeys.dailyBalances.all(),
        financeKeys.upcoming.all(),
      ]);
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

  // Spec 094: the favorite of the filter, when it is one of the accounts the balances cover (active, in the filter).
  const balanceAccountIds = new Set(
    (balancesNow.data?.accounts ?? []).map((account) => account.id),
  );
  const favorite = resolveFavoriteAccount(
    (accounts.data ?? []).filter((account) =>
      balanceAccountIds.has(account.id),
    ),
    { currency },
  );
  const ownersFailed = !!owners.error && !ownersReady;
  const balanceState = combineBlocks(
    [summary, balancesNow, accounts],
    ownersFailed,
    owners.refetch,
    () =>
      new FinanceBalanceUIModel(
        summary.data as MonthSummaryDTO,
        balancesNow.data as DailyBalanceDTO,
        accounts.data as AccountDTO[],
        now,
        languageTag,
        favorite,
      ),
  );
  const lowestState = combineBlocks(
    [balancesNow, balancesNext],
    ownersFailed,
    owners.refetch,
    () =>
      new LowestBalanceUIModel(
        balancesNow.data as DailyBalanceDTO,
        balancesNext.data as DailyBalanceDTO,
        now,
        languageTag,
        favorite && { id: favorite.id, name: favorite.name },
      ),
  );
  const stockState = toBlock(
    stock,
    ownersFailed,
    owners.refetch,
    (dto) => new StockAttentionUIModel(dto, ownerList),
  );
  const upcomingState = toBlock(
    upcoming,
    ownersFailed,
    owners.refetch,
    (dto) => new UpcomingUIModel(dto, now, languageTag),
  );

  const { openModal } = useModalNavigation();

  function push(
    path: string | { params: Record<string, string>; pathname: string },
  ) {
    router.push(path as never);
  }

  function onUpcomingItemPress(item: UpcomingItemDTO) {
    if (item.kind === "PROJECTION") {
      openModal("add_new_transaction", {
        month: item.date.slice(0, 7),
        occurrenceNumber: String(item.occurrenceNumber),
        recurrenceId: item.recurrenceId as string,
      });

      return;
    }

    openModal("add_new_transaction", { id: item.id });
  }

  // The transactions screen filtered by that card, on the month the invoice is due.
  function onInvoicePress(item: UpcomingItemDTO) {
    setTransactionFilters({
      ...EMPTY_FILTERS,
      cardIds: [item.creditCardId as string],
      origin: "CARD",
      period: monthPeriod(item.date),
    });
    push("/financial/transaction");
  }

  return {
    balance: balanceState,
    currency: {
      onChange: (value: string) =>
        screenCurrency.setCurrency(value as CurrencyCode),
      options: screenCurrency.options,
      value: currency,
      visible: screenCurrency.visible,
    },
    filter: {
      onChange: setSelection,
      options: buildOwnerFilterOptions(ownerList),
      value: selection,
    },
    header: new HomeHeaderUIModel(user.data, now, languageTag),
    isRefreshing,
    isSplitLayout: breakpoint === "expanded",
    lowest: lowestState,
    onAddStockItemPress: () => openModal("add_new_stock_item"),
    onAddTransactionPress: () => openModal("add_new_transaction"),
    onCreateAccountPress: () => openModal("add_new_account"),
    onInvoicePress,
    onOverviewPress: () => push("/financial/overview"),
    onRefresh,
    onStockSeeAllPress: () =>
      push({ params: { filter: "EXPIRING" }, pathname: "/stock" }),
    onUpcomingItemPress,
    onUpcomingSeeAllPress: () => push("/financial/transaction"),
    stock: stockState,
    upcoming: upcomingState,
  };
}
