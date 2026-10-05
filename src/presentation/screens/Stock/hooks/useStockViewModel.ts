import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import StockListUIModel, {
  StockFilters,
  StockSort,
} from "@screens/Stock/models/StockListUIModel";

const SEARCH_DEBOUNCE_MS = 200;
const FILTER_PARAMS: string[] = [
  StockFilters.ALL,
  StockFilters.EXPIRED,
  StockFilters.EXPIRING,
];

interface StockData {
  items: StockDTO[];
  owners: OwnerDTO[];
}

export async function fetchStock(): Promise<StockData> {
  const owners = await useCases.getOwnersUseCase.execute();
  const items = await useCases.getStockItemsUseCase.execute({
    ownerIds: owners.map((owner) => owner.id),
  });

  return { items, owners };
}

function useStockViewModel() {
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { getLocale } = useTranslationLocale();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<string>(
    params.filter && FILTER_PARAMS.includes(params.filter)
      ? params.filter
      : StockFilters.ALL,
  );
  const [sort, setSort] = useState<StockSort>("EXPIRATION");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { data, error, isFetching, refetch } = useQuery<StockData>({
    cacheKey: [useCases.getStockItemsUseCase.uniqueName],
    fetch: fetchStock,
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (params.filter && FILTER_PARAMS.includes(params.filter)) {
      setFilter(params.filter);
      // Consume the param: otherwise a repeated "See all" (same value) never re-applies.
      router.setParams({ filter: undefined });
    }
  }, [params.filter]);

  const locale = getLocale().languageTag;
  const list = useMemo(
    () =>
      data
        ? new StockListUIModel(data.items, data.owners, new Date(), locale)
        : undefined,
    [data, locale],
  );

  const view = list?.view({ filter, search: debouncedSearch, sort });
  const selectedItem = list?.items.find((item) => item.id === selectedId);
  const activeFilter = view?.activeFilter ?? StockFilters.ALL;

  function onAddPress() {
    const isOwnerFilter = !(Object.values(StockFilters) as string[]).includes(
      activeFilter,
    );

    router.push(
      isOwnerFilter
        ? {
            params: { ownerId: activeFilter },
            pathname: "/stock/add_new_stock_item",
          }
        : { pathname: "/stock/add_new_stock_item" },
    );
  }

  function onClearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setFilter(StockFilters.ALL);
  }

  function onItemDeleted() {
    setSelectedId(undefined);
    refetch();
  }

  function onSortChange(value: StockSort) {
    setSort(value);
    setIsSortOpen(false);
  }

  return {
    activeFilter,
    errorMessageKey:
      error && !data ? ("common.errors.generic" as const) : undefined,
    filterOptions: view?.filterOptions ?? [],
    hasNoResults: view?.hasNoResults ?? false,
    isEmpty: !!list && list.total === 0,
    isLoading: isFetching && !data,
    isRefreshing: isFetching && !!data,
    isSortOpen,
    onAddPress,
    onClearFilters,
    onCloseDetails: () => setSelectedId(undefined),
    onCloseSort: () => setIsSortOpen(false),
    onFilterChange: setFilter,
    onItemDeleted,
    onItemPress: setSelectedId,
    onOpenSort: () => setIsSortOpen(true),
    onRefresh: async () => refetch(),
    onRetry: async () => refetch(),
    onSearchChange: setSearch,
    onSortChange,
    rows: view?.rows ?? [],
    search,
    selectedItem,
    sort,
    sortOptions: [
      {
        labelKey: "stock.list.sort.expiration" as const,
        value: "EXPIRATION" as const,
      },
      { labelKey: "stock.list.sort.name" as const, value: "NAME" as const },
      {
        labelKey: "stock.list.sort.recent" as const,
        value: "RECENT" as const,
      },
    ],
    subtitle: {
      attention: list?.attentionCount ?? 0,
      total: list?.total ?? 0,
    },
  };
}

export default useStockViewModel;
