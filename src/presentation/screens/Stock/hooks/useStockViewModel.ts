import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { StockCategoryDTO } from "@application/dto/stock/StockCatalogDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import {
  StockCatalogStatus,
  StockLocationDetailEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useTranslationLocale } from "@presentation/i18n";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import useStockQuickMovement from "@screens/Stock/hooks/useStockQuickMovement";
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

export type StockVM = ReturnType<typeof useStockViewModel>;

interface CatalogData {
  categories: Array<{ id: string; label: string; parentId?: string }>;
  locations: Array<{ id: string; label: string }>;
}

interface StockData {
  items: StockDTO[];
  owners: OwnerDTO[];
}

// The chosen categories and every category below them (a parent includes its children).
export function expandCategoryIds(
  selected: string[],
  categories: CatalogData["categories"],
): Set<string> {
  const ids = new Set(selected);
  let grew = true;

  while (grew) {
    grew = false;
    categories.forEach((category) => {
      if (
        category.parentId &&
        ids.has(category.parentId) &&
        !ids.has(category.id)
      ) {
        ids.add(category.id);
        grew = true;
      }
    });
  }

  return ids;
}

// Categories and locations of every active owner, for the two filter chips (read only when a chip is used).
export async function fetchCatalog(owners: OwnerDTO[]): Promise<CatalogData> {
  const active = owners.filter((owner) => !owner.archived);
  const multiple = active.length > 1;
  const rows = await Promise.all(
    active.map(async (owner) => {
      const params = {
        owner: owner.type === OwnerType.FAMILY ? "FAMILY" : "USER",
        ownerId: owner.id,
      };
      const [categories, locations] = await Promise.all([
        useCases.getStockCategoriesUseCase.execute(params),
        useCases.getStockLocationsUseCase.execute(params),
      ]);

      return { categories, locations, owner };
    }),
  );
  function suffix(owner: OwnerDTO) {
    return multiple ? ` · ${owner.name}` : "";
  }

  return {
    categories: rows.flatMap(({ categories, owner }) =>
      flattenCategories(categories).map((category) => ({
        id: category.id,
        label: `${category.path}${suffix(owner)}`,
        parentId: category.parentId,
      })),
    ),
    locations: rows.flatMap(({ locations, owner }) =>
      locations.map((location) => ({
        id: location.id,
        label: `${location.name}${suffix(owner)}`,
      })),
    ),
  };
}

export async function fetchStock(owners: OwnerDTO[]): Promise<StockData> {
  const items = await useCases.getStockItemsUseCase.execute({
    ownerIds: owners.map((owner) => owner.id),
  });

  return { items, owners };
}

// Active categories as a flat list with their "Dairy › Cheese" path.
function flattenCategories(
  nodes: StockCategoryDTO[],
  prefix = "",
): Array<{ id: string; parentId?: string; path: string }> {
  return nodes
    .filter((node) => node.status === "ACTIVE")
    .flatMap((node) => {
      const path = prefix ? `${prefix} › ${node.name}` : node.name;

      return [
        { id: node.id, parentId: node.parentId, path },
        ...flattenCategories(node.children, path),
      ];
    });
}

export default useStockViewModel;

// A location that is missing or not readable answers 404 (no data leaks): "Local não encontrado".
function isNotFound(error: unknown) {
  if (!(error instanceof GenericError)) {
    return false;
  }

  const cause = error.context.error as undefined | { statusCode?: number };

  return cause?.statusCode === 404;
}

function useStockViewModel() {
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{
    filter?: string;
    id?: string;
    item?: string;
  }>();
  // Spec 117 FR 20: `/stock/locations/<id>` is this screen filtered by that location.
  const routeLocationId = params.id;
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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>(
    routeLocationId ? [routeLocationId] : [],
  );
  const [openFilter, setOpenFilter] = useState<
    "category" | "location" | undefined
  >();

  const { data, error, isFetching, refetch } = useOwnerScopedQuery<StockData>({
    cacheKey: [useCases.getStockItemsUseCase.uniqueName],
    fetch: fetchStock,
  });

  const routeLocation = useQuery<StockLocationDetailEntity>({
    cacheKey: [
      useCases.getStockLocationUseCase.uniqueName,
      routeLocationId ?? "",
    ],
    enabled: !!routeLocationId,
    fetch: async () =>
      useCases.getStockLocationUseCase.execute({
        id: routeLocationId as string,
      }),
  });

  const catalog = useOwnerScopedQuery<CatalogData>({
    cacheKey: [useCases.getStockCategoriesUseCase.uniqueName, "filters"],
    enabled:
      openFilter !== undefined || categoryIds.length + locationIds.length > 0,
    fetch: fetchCatalog,
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

  // Spec 121 FR 10: "Abrir detalhe" in the barcode reader opens the details of that item.
  useEffect(() => {
    if (params.item) {
      setSelectedId(params.item);
      router.setParams({ item: undefined });
    }
  }, [params.item]);

  const locale = getLocale().languageTag;
  const list = useMemo(
    () =>
      data ? new StockListUIModel(data.items, data.owners, locale) : undefined,
    [data, locale],
  );

  const view = list?.view({
    categoryIds: expandCategoryIds(categoryIds, catalog.data?.categories ?? []),
    filter,
    locationIds: new Set(locationIds),
    search: debouncedSearch,
    sort,
  });
  const selectedItem = list?.items.find((item) => item.id === selectedId);
  const activeFilter = view?.activeFilter ?? StockFilters.ALL;

  const quick = useStockQuickMovement({ onSettled: async () => refetch() });
  const scope = useReadOnlyScope(data?.owners, activeFilter);
  const { openModal } = useModalNavigation();

  const onAddPress = scope.guard(() => {
    const isOwnerFilter = !(Object.values(StockFilters) as string[]).includes(
      activeFilter,
    );

    openModal(
      "add_new_stock_item",
      isOwnerFilter ? { ownerId: activeFilter } : undefined,
    );
  });

  // Spec 121 FR 4: the reader opens with the owner of the filter, so a code in two owners picks it.
  function onScanPress() {
    const isOwnerFilter = !(Object.values(StockFilters) as string[]).includes(
      activeFilter,
    );

    openModal(
      "stock_barcode",
      isOwnerFilter ? { ownerId: activeFilter } : undefined,
    );
  }

  function onClearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setFilter(StockFilters.ALL);
    setCategoryIds([]);
    setLocationIds([]);
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
    categoryIds,
    categoryOptions: catalog.data?.categories ?? [],
    errorMessageKey:
      error && !data ? ("common.errors.generic" as const) : undefined,
    filterOptions: view?.filterOptions ?? [],
    hasNoResults: view?.hasNoResults ?? false,
    isCatalogLoading: catalog.isFetching && !catalog.data,
    isEmpty: !!list && list.items.length === 0,
    isLoading: isFetching && !data,
    isRefreshing: isFetching && !!data,
    isSortOpen,
    locationIds,
    locationOptions: catalog.data?.locations ?? [],
    locationRoute: routeLocationId
      ? {
          archived: routeLocation.data?.status === StockCatalogStatus.ARCHIVED,
          isLoading: !routeLocation.data && !routeLocation.error,
          name: routeLocation.data?.name,
          notFound: isNotFound(routeLocation.error),
        }
      : undefined,
    onAddPress,
    onBackToStock: () => router.replace("/stock" as never),
    onCatalogPress: scope.guard(() => openModal("stock_catalog")),
    onCategoriesChange: setCategoryIds,
    onClearFilters,
    onCloseDetails: () => setSelectedId(undefined),
    onCloseFilterSheet: () => setOpenFilter(undefined),
    onCloseSort: () => setIsSortOpen(false),
    onFilterChange: setFilter,
    onItemDeleted,
    onItemPress: scope.guard(setSelectedId),
    onLocationsChange: setLocationIds,
    onOpenCategorySheet: () => setOpenFilter("category"),
    onOpenLocationSheet: () => setOpenFilter("location"),
    onOpenSort: () => setIsSortOpen(true),
    onRefresh: async () => refetch(),
    onRetry: async () => refetch(),
    onScanPress,
    onSearchChange: setSearch,
    onSortChange,
    onToastHide: scope.onToastHide,
    openFilter,
    quick,
    readOnly: scope.readOnly,
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
    toastVisible: scope.toastVisible,
  };
}
