import { router, usePathname } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { activityKeys } from "@application/queryKeys/activityKeys";
import { useCases } from "@application/useCases";
import {
  ActivityActionFilter,
  ActivityEntryEntity,
  ActivityModule,
  ActivityPageEntity,
} from "@domain/entities/activity/ActivityEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  activeFilterCount,
  ActivityFilterState,
  ALL,
  filterKey,
  INITIAL_FILTERS,
  toApiFilters,
} from "../models/activityFilters";
import {
  ActivityDayUI,
  ActivityRowUI,
  buildActivityDays,
  Translate,
  whoOf,
} from "../models/activityRows";

export type ActivityVM = ReturnType<typeof useActivityViewModel>;

const SEARCH_DEBOUNCE_MS = 350;

function moduleOf(pathname: string): ActivityModule {
  return pathname.includes("/investments") ? "INVESTMENT" : "FINANCE";
}

// Spec 127 FR 9-12 and section 8: the history of one module, newest first, 50 per page, filtered by period, action,
// owner, author and text.
function useActivityViewModel() {
  const { t } = useTranslation();
  const { getLocale } = useTranslationLocale();
  const languageTag = getLocale().languageTag;
  const pathname = usePathname();
  const { openModal } = useModalNavigation();
  const owners = useOwners();
  const [module, setModule] = useState<ActivityModule>(moduleOf(pathname));
  const [filters, setFilters] = useState<ActivityFilterState>(INITIAL_FILTERS);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [more, setMore] = useState<{
    cursor: null | string;
    items: ActivityEntryEntity[];
  }>({ cursor: null, items: [] });
  const apiFilters = useMemo(
    () => toApiFilters(module, filters, new Date()),
    [module, filters],
  );
  const key = filterKey(apiFilters);
  const list = useQuery<ActivityPageEntity>({
    cacheKey: activityKeys.list(key),
    fetch: async () => useCases.getActivityUseCase.execute(apiFilters),
  });
  const loadMore = useMutation<string, ActivityPageEntity>({
    cacheKey: [useCases.getActivityUseCase.uniqueName, "more"],
    fetch: async (cursor) =>
      useCases.getActivityUseCase.execute({ ...apiFilters, cursor }),
  });

  useEffect(() => {
    const timer = setTimeout(
      () => setFilters((current) => ({ ...current, q: search })),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timer);
  }, [search]);

  // A new first page (filter change, refetch) replaces what "Carregar mais" had appended.
  useEffect(() => {
    setMore({ cursor: null, items: [] });
  }, [key, list.data]);

  useEffect(() => {
    const page = loadMore.data;

    if (page) {
      setMore((current) => ({
        cursor: page.nextCursor,
        items: [...current.items, ...page.items],
      }));
    }
  }, [loadMore.data]);

  const entries = useMemo(
    () => [...(list.data?.items ?? []), ...more.items],
    [list.data, more.items],
  );
  const ownerList = owners.data ?? [];
  const currentUserId =
    ownerList.find((owner) => owner.type === "USER")?.id ?? "";
  const hasFamily = ownerList.length > 1;
  const days: ActivityDayUI[] = useMemo(
    () =>
      buildActivityDays(entries, {
        currentUserId,
        languageTag,
        showOwner: hasFamily,
        t: t as Translate,
        today: new Date().toLocaleDateString("en-CA"),
      }),
    [entries, currentUserId, languageTag, hasFamily, t],
  );
  const actorChoices = useMemo(() => {
    const seen = new Map<string, string>();

    for (const entry of entries) {
      if (entry.actor.id && !seen.has(entry.actor.id)) {
        seen.set(
          entry.actor.id,
          whoOf(entry, { currentUserId, t: t as Translate }),
        );
      }
    }

    return [...seen.entries()].map(([value, label]) => ({ label, value }));
  }, [entries, currentUserId, t]);
  const ownerChoices = ownerList.map((owner) => ({
    label: owner.type === "USER" ? t("activity.personal") : owner.name,
    value: owner.id,
  }));
  const nextCursor =
    more.items.length > 0 ? more.cursor : (list.data?.nextCursor ?? null);

  function open(row: ActivityRowUI) {
    const { target } = row;

    if (!target) {
      return;
    }

    if ("modal" in target) {
      openModal(target.modal, target.params);
    } else {
      router.push(target.path as never);
    }
  }

  return {
    actorChoices,
    days,
    errorKey:
      list.error && !list.data ? ("activity.error" as const) : undefined,
    filterCount: activeFilterCount(filters),
    filters,
    hasFamily,
    hasNext: nextCursor !== null,
    isEmpty: !list.isFetching && entries.length === 0 && !list.error,
    isLoading: list.isFetching && !list.data,
    isLoadingMore: loadMore.isFetching,
    module,
    onActionChange: (value: string) =>
      setFilters((current) => ({
        ...current,
        action: value === ALL ? ALL : (value as ActivityActionFilter),
      })),
    onActorChange: (value: string) =>
      setFilters((current) => ({ ...current, actorId: value })),
    onClearFilters: () => {
      setSearch("");
      setFilters(INITIAL_FILTERS);
    },
    onLoadMore: () => nextCursor && loadMore.mutate(nextCursor),
    onModuleChange: (value: string) => setModule(value as ActivityModule),
    onOpen: open,
    onOwnerChange: (value: string) =>
      setFilters((current) => ({ ...current, ownerId: value })),
    onPeriodChange: (value: string) =>
      setFilters((current) => ({
        ...current,
        period: value as ActivityFilterState["period"],
      })),
    onRetry: async () => list.refetch(),
    onSearchChange: setSearch,
    onSheetClose: () => setSheetOpen(false),
    onSheetOpen: () => setSheetOpen(true),
    onViewItems: (row: ActivityRowUI) =>
      openModal("activity_batch", {
        assetId: row.assetId ?? "",
        file: row.fileName ?? "",
        id: row.id,
        owner: row.ownerName,
        title: `${row.verb}`,
        when: `${row.who} · ${row.time}`,
      }),
    ownerChoices,
    search,
    sheetOpen,
  };
}

export default useActivityViewModel;
