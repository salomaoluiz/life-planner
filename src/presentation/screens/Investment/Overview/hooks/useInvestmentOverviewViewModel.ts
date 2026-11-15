import { router } from "expo-router";
import { useMemo, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentDashboard } from "@domain/entities/investment/InvestmentEntities";
import useOwners from "@presentation/hooks/useOwners";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { useTheme } from "@presentation/theme";
import {
  activeOwnerIds,
  ALL_OWNERS,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  bucketUnitKey,
  buildAllocation,
  buildIncome,
  buildRanking,
  buildTiles,
  CLASS_LABEL_KEYS,
  percentText,
  presets,
  seriesLabels,
} from "../models/dashboardModel";
import {
  canGoNext,
  defaultCustomPeriod,
  InvestmentsPeriod,
  InvestmentsPreset,
  periodForPreset,
  shiftCustomPeriod,
} from "../models/investmentsPeriod";

export type InvestmentOverviewVM = ReturnType<
  typeof useInvestmentOverviewViewModel
>;

// The owner choices carry a label (a family name) or a translation key ("All" / "Personal").
function ownerLabelKeyToText(
  label: undefined | { label?: string; labelKey?: string },
  t: (key: TranslationKeys) => string,
): string {
  return (
    label?.label ??
    (label?.labelKey ? t(label.labelKey as TranslationKeys) : "")
  );
}

function useInvestmentOverviewViewModel() {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { isDark } = useTheme();
  const { openModal } = useModalNavigation();
  const today = toDateKey(new Date());
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS);
  const [preset, setPreset] = useState<InvestmentsPreset>("12M");
  const [customPeriod, setCustomPeriod] = useState<InvestmentsPeriod>();
  const [offset, setOffset] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<
    InvestmentAssetClass | undefined
  >();
  const [expanded, setExpanded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number>();

  // Spec 110 FR 3: CUSTOM keeps its own range; the presets always end today.
  const period =
    preset === "CUSTOM"
      ? (customPeriod ?? defaultCustomPeriod(today))
      : periodForPreset(preset, today, offset);

  const query = useOwnerScopedQuery<InvestmentDashboard>({
    cacheKey: investmentKeys.dashboard(ownerFilter, period.from, period.to),
    fetch: async (owners) => {
      const ownerIds =
        ownerFilter === ALL_OWNERS ? activeOwnerIds(owners) : [ownerFilter];

      return useCases.getInvestmentDashboardUseCase.execute({
        from: period.from,
        ownerIds,
        to: period.to,
        today,
      });
    },
    keepPreviousData: true,
  });
  const ownersQuery = useOwners();
  const owners = ownersQuery.data ?? [];
  const dashboard = query.data;
  const ownerChoices = buildOwnerFilterChoices(owners);
  const ownerChoice = ownerChoices.find(
    (choice) => choice.value === ownerFilter,
  );

  const tiles = useMemo(
    () =>
      dashboard ? buildTiles({ currency: "BRL", dashboard, localeTag, t }) : [],
    [dashboard, localeTag, t],
  );
  const allocation = useMemo(
    () =>
      dashboard
        ? buildAllocation({
            dashboard,
            isDark,
            localeTag,
            selected: selectedClass,
            t,
          })
        : undefined,
    [dashboard, isDark, localeTag, selectedClass, t],
  );
  const ranking = useMemo(
    () =>
      dashboard
        ? buildRanking({
            dashboard,
            expanded,
            isDark,
            localeTag,
            selected: selectedClass,
            t,
          })
        : undefined,
    [dashboard, expanded, isDark, localeTag, selectedClass, t],
  );
  const income = useMemo(
    () =>
      dashboard
        ? buildIncome({
            buckets: dashboard.incomes,
            dashboard,
            localeTag,
          })
        : [],
    [dashboard, localeTag],
  );
  const labels = useMemo(
    () => (dashboard ? seriesLabels(dashboard, localeTag) : []),
    [dashboard, localeTag],
  );

  function selectPreset(next: InvestmentsPreset) {
    setPreset(next);
    setOffset(0);
    setSelectedClass(undefined);
    if (next === "CUSTOM" && !customPeriod) {
      setCustomPeriod(defaultCustomPeriod(today));
    }
  }

  function move(direction: -1 | 1) {
    setSelectedClass(undefined);
    setSelectedPoint(undefined);

    if (preset === "CUSTOM") {
      const next = shiftCustomPeriod(period, direction);

      setCustomPeriod(next.to > today ? { ...next, to: today } : next);
      return;
    }

    if (direction === 1 && !canGoNext(preset, today, offset)) {
      return;
    }

    setOffset(offset + direction);
  }

  function selectClass(assetClass: InvestmentAssetClass) {
    setSelectedClass(selectedClass === assetClass ? undefined : assetClass);
    setExpanded(false);
  }

  return {
    allocation,
    bucketUnit: dashboard
      ? t(
          `investment.overview.unit.${bucketUnitKey(dashboard.period.bucket)}` as TranslationKeys,
        )
      : "",
    canGoNext:
      preset === "CUSTOM"
        ? shiftCustomPeriod(period, 1).from <= today
        : canGoNext(preset, today, offset),
    customOpen,
    emptyMessage:
      ownerFilter === ALL_OWNERS
        ? t("investment.overview.empty")
        : t("investment.overview.emptyOwner", {
            owner: ownerLabelKeyToText(ownerChoice, t),
          }),
    expanded,
    hasPositions: (dashboard?.ranking.length ?? 0) > 0,
    historyStartsAt: dashboard?.summary.historyStartsAt,
    income,
    isFetching: query.isFetching,
    labels,
    noValue:
      (dashboard?.summary.assetsWithoutValue ?? 0) > 1
        ? t("investment.overview.noValue_other", {
            count: dashboard?.summary.assetsWithoutValue,
          })
        : t("investment.overview.noValue_one", {
            count: dashboard?.summary.assetsWithoutValue ?? 0,
          }),
    onAddAsset: () => openModal("investment_asset"),
    onClearFilter: () => {
      setSelectedClass(undefined);
      setExpanded(false);
    },
    onCustomApply: (next: InvestmentsPeriod) => {
      setCustomPeriod(next);
      setPreset("CUSTOM");
      setCustomOpen(false);
      setSelectedClass(undefined);
    },
    onCustomClose: () => setCustomOpen(false),
    onCustomOpen: () => setCustomOpen(true),
    onNext: () => move(1),
    onOpenAsset: (assetId: string) =>
      router.push(`/investments/asset/${assetId}`),
    onOwnerFilterChange: (next: string) => {
      setOwnerFilter(next);
      setSelectedClass(undefined);
      setExpanded(false);
    },
    onPresetChange: selectPreset,
    onPrevious: () => move(-1),
    onRetry: async () => query.refetch(),
    onSeeAll: () => setExpanded(true),
    onSelectClass: selectClass,
    onSelectPoint: setSelectedPoint,
    onToday: () => {
      setOffset(0);
      setSelectedClass(undefined);

      if (preset === "CUSTOM") {
        setCustomPeriod(defaultCustomPeriod(today));
      }
    },
    openResultPercent:
      dashboard?.summary.openResultPercent === undefined
        ? undefined
        : percentText(dashboard.summary.openResultPercent, localeTag),
    ownerChoices,
    ownerFilter,
    period,
    preset,
    presets: presets(),
    ranking,
    rankingFilterLabel: selectedClass
      ? t(CLASS_LABEL_KEYS[selectedClass] as TranslationKeys)
      : undefined,
    selectedClass,
    selectedPoint,
    series: dashboard?.series ?? [],
    showNoValue: (dashboard?.summary.assetsWithoutValue ?? 0) > 0,
    showStale: (dashboard?.summary.staleQuotes ?? 0) > 0,
    staleMessage:
      dashboard && dashboard.summary.staleQuotes === 1
        ? t("investment.overview.stale_one", {
            count: dashboard.summary.staleQuotes,
          })
        : t("investment.overview.stale_other", {
            count: dashboard?.summary.staleQuotes ?? 0,
          }),
    status: query.status,
    summary: dashboard?.summary,
    tiles,
    today,
    totalRanking: ranking?.total ?? 0,
  };
}

export default useInvestmentOverviewViewModel;
