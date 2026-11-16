import { router } from "expo-router";
import { useMemo, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentsDashboard } from "@domain/entities/investment/InvestmentEntities";
import { useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import {
  activeOwnerIds,
  ALL_OWNERS,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";
import useInvestmentOwnerFilter from "@screens/Investment/hooks/useInvestmentOwnerFilter";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  canShiftForward,
  defaultCustomPeriod,
  InvestmentPeriod,
  InvestmentPreset,
  shiftCustomPeriod,
  shiftPresetPeriod,
} from "../models/investmentPeriod";

export type InvestmentOverviewVM = ReturnType<
  typeof useInvestmentOverviewViewModel
>;

type FixedPreset = Exclude<InvestmentPreset, "CUSTOM">;

export default useInvestmentOverviewViewModel;

function useInvestmentOverviewViewModel() {
  const { openModal } = useModalNavigation();
  const today = toDateKey(new Date());
  const [ownerSelection, setOwnerSelection] = useInvestmentOwnerFilter();
  const [preset, setPreset] = useState<InvestmentPreset>("12M");
  const [customPeriod, setCustomPeriod] = useState<InvestmentPeriod>();
  // Steps back from today for a fixed preset (spec 055 FR 4); the offset is not persisted.
  const [offset, setOffset] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<InvestmentAssetClass>();
  const [selectedPoint, setSelectedPoint] = useState<number>();
  const [selectedIncome, setSelectedIncome] = useState<number>();
  const [expanded, setExpanded] = useState(false);

  const owners = useOwners().data;
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
  const readOnlyScope = useReadOnlyScope(owners, ownerFilter);

  const customInitial = customPeriod ?? defaultCustomPeriod(today);
  const period: InvestmentPeriod =
    preset === "CUSTOM"
      ? customInitial
      : shiftPresetPeriod(preset, today, offset);
  const nextPeriod: InvestmentPeriod =
    preset === "CUSTOM"
      ? shiftCustomPeriod(period, 1, today)
      : shiftPresetPeriod(preset, today, offset + 1);
  const canGoNext = canShiftForward(nextPeriod, today);

  const dashboard = useQuery<InvestmentsDashboard>({
    cacheKey: investmentKeys.dashboard(
      JSON.stringify({ from: period.from, ownerIds, to: period.to, today }),
    ),
    enabled: !!owners && ownerIds.length > 0,
    fetch: async () =>
      useCases.getInvestmentsDashboardUseCase.execute({
        from: period.from,
        ownerIds,
        to: period.to,
        today,
      }),
  });
  const data = dashboard.data;
  // No operation at all for the owners (a portfolio whose positions are all closed still has points).
  const isEmpty =
    !!data &&
    data.ranking.length === 0 &&
    data.series.every((point) => point.marketValue === null);

  // What the user picked on the screen only lives for one owner and one period (spec 110 FR 18).
  function resetSelection() {
    setSelectedClass(undefined);
    setSelectedPoint(undefined);
    setSelectedIncome(undefined);
    setExpanded(false);
  }

  return {
    canGoNext,
    customInitial,
    customOpen,
    dashboard,
    expanded,
    isEmpty,
    onAddAsset: readOnlyScope.guard(() => openModal("investment_asset")),
    onApplyCustomPeriod(value: InvestmentPeriod) {
      resetSelection();
      setCustomPeriod(value);
      setPreset("CUSTOM");
      setCustomOpen(false);
    },
    onAssetPress: (id: string) => router.push(`/investments/asset/${id}`),
    onBackToToday() {
      resetSelection();
      setOffset(0);
    },
    onClassClear() {
      setExpanded(false);
      setSelectedClass(undefined);
    },
    onClassSelect(assetClass: InvestmentAssetClass) {
      setExpanded(false);
      setSelectedClass(selectedClass === assetClass ? undefined : assetClass);
    },
    onCustomClose: () => setCustomOpen(false),
    onIncomeSelect: setSelectedIncome,
    onNextPeriod() {
      if (!canGoNext) {
        return;
      }
      resetSelection();
      if (preset === "CUSTOM") {
        setCustomPeriod(nextPeriod);

        return;
      }
      setOffset(offset + 1);
    },
    onOwnerFilterChange(value: string) {
      resetSelection();
      setOwnerSelection(value);
    },
    onPointSelect: setSelectedPoint,
    onPresetChange(value: string) {
      if (value === "CUSTOM") {
        setCustomOpen(true);

        return;
      }
      resetSelection();
      setOffset(0);
      setPreset(value as FixedPreset);
    },
    // Pressing Custom again reopens its sheet; a fixed preset goes back to today (spec 055 FR 7).
    onPresetReselect(value: string) {
      if (value === "CUSTOM") {
        setCustomOpen(true);

        return;
      }
      resetSelection();
      setOffset(0);
    },
    onPreviousPeriod() {
      resetSelection();
      if (preset === "CUSTOM") {
        setCustomPeriod(shiftCustomPeriod(period, -1, today));

        return;
      }
      setOffset(offset - 1);
    },
    onRetry: async () => dashboard.refetch(),
    onSeeAll: () => setExpanded(true),
    ownerChoices: buildOwnerFilterChoices(owners ?? []),
    ownerFilter,
    ownerIds,
    period,
    preset,
    readOnlyScope,
    selectedClass,
    selectedIncome,
    selectedPoint,
    showToday: preset !== "CUSTOM" && offset !== 0,
    today,
  };
}
