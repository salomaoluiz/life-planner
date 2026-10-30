import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import {
  BalanceSeriesEntity,
  DashboardGranularity,
  DashboardSummaryEntity,
  DashboardTotalsEntity,
  DashboardType,
} from "@domain/entities/financial/DashboardEntity";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";
import { useQuery } from "@infrastructure/fetcher";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import {
  activeOwnerIds,
  ALL_OWNERS,
  archivedOwnerIds,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import { setPendingNavigation } from "@screens/Financial/Transactions/hooks/pendingNavigation";
import { setTransactionFilters } from "@screens/Financial/Transactions/hooks/useTransactionFilters";
import {
  activeGroups,
  toDateKey,
  toQueryFilter,
} from "@screens/Financial/Transactions/models/transactionFilters";

import toDrillThroughFilters from "../models/drillThrough";
import { defaultCurrency, keepOrDefault } from "../models/overviewFormat";
import {
  canShiftForward,
  defaultGranularity,
  granularityOptions,
  maxFutureDate,
  OverviewPeriod,
  OverviewPreset,
  periodForPreset,
  shiftCustomPeriod,
  shiftPresetPeriod,
} from "../models/overviewPeriod";
import useOverviewFilters from "./useOverviewFilters";

export type OverviewViewModel = ReturnType<typeof useOverviewViewModel>;

export interface ParentCategory {
  id: string;
  name: string;
  // The share of the type total and the amount, shown in the subcategories header.
  percent: string;
  value: number;
}

function useOverviewViewModel() {
  const isFocused = useIsFocused();
  const today = toDateKey(new Date());
  const filterStore = useOverviewFilters();
  const applied = filterStore.applied;

  const [ownerSelection, setOwnerSelection] = useState(ALL_OWNERS);
  const [preset, setPreset] = useState<
    "CUSTOM" | Exclude<OverviewPreset, "CUSTOM">
  >("1M");
  const [customPeriod, setCustomPeriod] = useState<OverviewPeriod>();
  // Steps from today for a fixed preset (spec 055 FR 4); the offset is not persisted.
  const [offset, setOffset] = useState(0);
  const [currencyChoice, setCurrencyChoice] = useState<string>();
  const [currency, setCurrency] = useState("BRL");
  const [granularityChoice, setGranularityChoice] =
    useState<DashboardGranularity>();
  const [type, setType] = useState<DashboardType>("EXPENSE");
  const [parent, setParent] = useState<ParentCategory>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number>();
  const [selectedGroup, setSelectedGroup] = useState<number>();

  const ownersQuery = useQuery<OwnerDTO[]>({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
  const owners = ownersQuery.data;
  const ownerFilter =
    ownerSelection === ALL_OWNERS ||
    (owners ?? []).some((owner) => owner.id === ownerSelection)
      ? ownerSelection
      : ALL_OWNERS;
  const ownerIds = useMemo(
    () =>
      ownerFilter === ALL_OWNERS ? activeOwnerIds(owners ?? []) : [ownerFilter],
    [ownerFilter, owners],
  );
  const allOwnerIds = useMemo(
    () => (owners ?? []).map((owner) => owner.id),
    [owners],
  );
  const archivedIds = useMemo(() => archivedOwnerIds(owners ?? []), [owners]);
  const readOnlyScope = useReadOnlyScope(owners, ownerFilter);

  const period: OverviewPeriod =
    preset === "CUSTOM"
      ? (customPeriod ?? periodForPreset("1M", today))
      : shiftPresetPeriod(preset, today, offset);
  const nextPeriod: OverviewPeriod =
    preset === "CUSTOM"
      ? shiftCustomPeriod(period, 1)
      : shiftPresetPeriod(preset, today, offset + 1);
  const canGoNext = canShiftForward(nextPeriod, today);
  const granularity =
    granularityChoice ?? defaultGranularity(period.from, period.to);
  const options = granularityOptions(period.from, period.to);
  const effectiveGranularity = options.find(
    (option) => option.value === granularity,
  )?.enabled
    ? granularity
    : defaultGranularity(period.from, period.to);

  const queryFilter = useMemo<TransactionQueryFilter>(
    () => ({ ...toQueryFilter(applied), from: undefined, to: undefined }),
    [applied],
  );
  const base = {
    currency,
    filter: queryFilter,
    from: period.from,
    ownerIds,
    source: applied.origin,
    to: period.to,
  };
  const baseKey = JSON.stringify(base);
  const enabled = !!owners && ownerIds.length > 0;

  const summary = useQuery<DashboardSummaryEntity>({
    cacheKey: [
      useCases.getFinancialDashboardSummaryUseCase.uniqueName,
      baseKey,
    ],
    enabled,
    fetch: async () =>
      useCases.getFinancialDashboardSummaryUseCase.execute(base),
  });
  const balance = useQuery<BalanceSeriesEntity>({
    cacheKey: [
      useCases.getFinancialBalanceSeriesUseCase.uniqueName,
      baseKey,
      effectiveGranularity,
    ],
    enabled,
    fetch: async () =>
      useCases.getFinancialBalanceSeriesUseCase.execute({
        ...base,
        granularity: effectiveGranularity,
      }),
  });
  const periodTotals = useQuery<DashboardTotalsEntity>({
    cacheKey: [
      useCases.getFinancialTotalsUseCase.uniqueName,
      "PERIOD",
      baseKey,
    ],
    enabled,
    fetch: async () =>
      useCases.getFinancialTotalsUseCase.execute({
        ...base,
        groupBy: "PERIOD",
      }),
  });
  const categoryTotals = useQuery<DashboardTotalsEntity>({
    cacheKey: [
      useCases.getFinancialTotalsUseCase.uniqueName,
      "CATEGORY",
      baseKey,
      type,
      parent?.id ?? "",
    ],
    enabled,
    fetch: async () =>
      useCases.getFinancialTotalsUseCase.execute({
        ...base,
        groupBy: "CATEGORY",
        parentId: parent?.id,
        type,
      }),
  });
  const tagTotals = useQuery<DashboardTotalsEntity>({
    cacheKey: [
      useCases.getFinancialTotalsUseCase.uniqueName,
      "TAG",
      baseKey,
      type,
    ],
    enabled,
    fetch: async () =>
      useCases.getFinancialTotalsUseCase.execute({
        ...base,
        groupBy: "TAG",
        type,
      }),
  });

  // The currency: the default (most accounts) until the user picks one; a pick stays while it still exists.
  const currencies = summary.data?.currencies;

  useEffect(() => {
    if (!currencies || currencies.length === 0) {
      return;
    }

    const next = currencyChoice
      ? keepOrDefault(currencyChoice, currencies)
      : defaultCurrency(currencies);

    if (next !== currency) {
      setCurrency(next);
    }
  }, [currencies, currencyChoice]);

  // Back on screen: the numbers move with every write made elsewhere.
  const firstFocus = useRef(true);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    if (firstFocus.current) {
      firstFocus.current = false;

      return;
    }
    summary.refetch();
    balance.refetch();
    periodTotals.refetch();
    categoryTotals.refetch();
    tagTotals.refetch();
  }, [isFocused]);

  useEffect(() => {
    setSelectedPoint(undefined);
  }, [baseKey, effectiveGranularity]);
  useEffect(() => {
    setSelectedGroup(undefined);
  }, [baseKey]);
  // A new scope, period or filter closes the subcategories view.
  useEffect(() => {
    setParent(undefined);
  }, [baseKey, type]);

  function openTransactions(pick: { categoryId?: string; tagId?: string }) {
    setTransactionFilters(toDrillThroughFilters(applied, period, pick));
    setPendingNavigation({ scope: ownerFilter, type });
    router.push("/financial/transaction" as never);
  }

  const filtersActive =
    activeGroups(filterStore.filters).length > 0 ||
    applied.search.trim() !== "";
  const noTransactions =
    periodTotals.status === "success" &&
    periodTotals.data?.groupBy === "PERIOD" &&
    periodTotals.data.items.every(
      (item) =>
        item.income.realized +
          item.income.projected +
          item.expense.realized +
          item.expense.projected ===
        0,
    );

  return {
    allOwnerIds,
    archivedOwnerIds: archivedIds,
    balance,
    canGoNext,
    categoryTotals,
    currencies: currencies ?? [],
    currency,
    customOpen,
    customPeriod,
    effectiveGranularity,
    filtersActive,
    filtersOpen,
    filterStore,
    granularityOptions: options,
    limitDate: maxFutureDate(today),
    noTransactions,
    onApplyCustomPeriod(next: OverviewPeriod) {
      setCustomPeriod(next);
      setOffset(0);
      setPreset("CUSTOM");
      setCustomOpen(false);
    },
    onBack: () => setParent(undefined),
    onBackToToday: () => setOffset(0),
    onCategoryPress(
      id: string,
      name: string,
      hasChildren: boolean,
      share: { percent: string; value: number },
    ) {
      if (hasChildren && !parent) {
        setParent({ id, name, ...share });

        return;
      }
      openTransactions({ categoryId: id });
    },
    onCurrencyChange(code: string) {
      setCurrencyChoice(code);
      setCurrency(code);
    },
    onCustomClose: () => setCustomOpen(false),
    onFiltersClose: () => setFiltersOpen(false),
    onFiltersOpen: () => setFiltersOpen(true),
    onGranularityChange: (value: DashboardGranularity) =>
      setGranularityChoice(value),
    onNewTransaction: () =>
      router.push("/financial/transaction/add_new_transaction" as never),
    onNextPeriod() {
      if (!canGoNext) {
        return;
      }
      if (preset === "CUSTOM") {
        setCustomPeriod(nextPeriod);

        return;
      }
      setOffset(offset + 1);
    },
    onOpenParentTransactions: () =>
      parent && openTransactions({ categoryId: parent.id }),
    onOwnerFilterChange: setOwnerSelection,
    onPresetChange(value: string) {
      if (value === "CUSTOM") {
        setCustomOpen(true);

        return;
      }
      setOffset(0);
      setPreset(value as Exclude<OverviewPreset, "CUSTOM">);
    },
    // Pressing Custom again reopens its sheet; a fixed preset goes back to today (spec 055 FR 7).
    onPresetReselect(value: string) {
      if (value === "CUSTOM") {
        setCustomOpen(true);

        return;
      }
      setOffset(0);
    },
    onPreviousPeriod() {
      if (preset === "CUSTOM") {
        setCustomPeriod(shiftCustomPeriod(period, -1));

        return;
      }
      setOffset(offset - 1);
    },
    onTagPress: (id: string) => openTransactions({ tagId: id }),
    onTypeChange: (value: DashboardType) => setType(value),
    ownerChoices: buildOwnerFilterChoices(owners ?? []),
    ownerFilter,
    ownerIds,
    parent,
    period,
    periodTotals,
    preset,
    readOnlyScope,
    selectedGroup,
    selectedPoint,
    setSelectedGroup,
    setSelectedPoint,
    showToday: preset !== "CUSTOM" && offset !== 0,
    summary,
    tagTotals,
    today,
    type,
  };
}
export default useOverviewViewModel;
