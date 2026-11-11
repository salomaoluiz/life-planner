import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import {
  ALL_OWNERS,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import useQuoteRefresh from "@screens/Investment/hooks/useQuoteRefresh";
import {
  buildEntries,
  filterAssets,
} from "@screens/Investment/models/assetList";
import {
  hasQuotedAssets,
  latestQuoteTime,
} from "@screens/Investment/models/quoteInfo";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type InvestmentListVM = ReturnType<typeof useInvestmentListViewModel>;

interface AssetsData {
  assets: InvestmentAsset[];
  owners: OwnerDTO[];
}

function fetchAssets(status: InvestmentAssetStatus) {
  return async (owners: OwnerDTO[]): Promise<AssetsData> => ({
    assets: await useCases.getInvestmentAssetsUseCase.execute({ status }),
    owners,
  });
}

export { fetchAssets };
export default useInvestmentListViewModel;

function useInvestmentListViewModel() {
  const isFocused = useIsFocused();
  const [tab, setTab] = useState(InvestmentAssetStatus.ACTIVE);
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS);
  const [search, setSearch] = useState("");
  const { openModal } = useModalNavigation();
  const quoteRefresh = useQuoteRefresh();

  const active = useOwnerScopedQuery<AssetsData>({
    cacheKey: investmentKeys.assets(InvestmentAssetStatus.ACTIVE),
    fetch: fetchAssets(InvestmentAssetStatus.ACTIVE),
  });
  const archived = useOwnerScopedQuery<AssetsData>({
    cacheKey: investmentKeys.assets(InvestmentAssetStatus.ARCHIVED),
    fetch: fetchAssets(InvestmentAssetStatus.ARCHIVED),
  });

  useEffect(() => {
    if (isFocused) {
      active.refetch();
      archived.refetch();
    }
  }, [isFocused]);

  // Spec 107: the number of announced incomes waiting for a decision (stored, no provider call).
  const suggestions = useOwnerScopedQuery({
    cacheKey: [...investmentKeys.all(), "income-suggestions", "count"],
    fetch: async () =>
      (await useCases.getInvestmentIncomeSuggestionsUseCase.execute({})).length,
  });
  const owners = active.data?.owners ?? archived.data?.owners ?? [];
  const rowsByTab = useMemo(
    () => ({
      [InvestmentAssetStatus.ACTIVE]: filterAssets(
        active.data?.assets ?? [],
        owners,
        ownerFilter,
        search,
      ),
      [InvestmentAssetStatus.ARCHIVED]: filterAssets(
        archived.data?.assets ?? [],
        owners,
        ownerFilter,
        search,
      ),
    }),
    [active.data, archived.data, ownerFilter, search],
  );
  const entries = useMemo(() => buildEntries(rowsByTab[tab]), [rowsByTab, tab]);
  const current = tab === InvestmentAssetStatus.ACTIVE ? active : archived;
  const hasAny = (current.data?.assets.length ?? 0) > 0;
  const scope = useReadOnlyScope(current.data?.owners, ownerFilter);

  const activeAssets = rowsByTab[InvestmentAssetStatus.ACTIVE].map(
    (row) => row.asset,
  );

  // Spec 105 FR 25: matured titles with principal left come first, with their own card.
  const pendingAssets = activeAssets.filter(
    (asset) => asset.fixedIncome?.maturityPending,
  );

  async function refetch() {
    await Promise.all([active.refetch(), archived.refetch()]);
  }

  return {
    archivedCount: rowsByTab[InvestmentAssetStatus.ARCHIVED].length,
    assetsCount: rowsByTab[InvestmentAssetStatus.ACTIVE].length,
    entries,
    errorMessage: current.error?.message,
    hasAny,
    hasQuotes:
      tab === InvestmentAssetStatus.ACTIVE && hasQuotedAssets(activeAssets),
    isEmpty: !!current.data && !hasAny,
    isLoading: current.isFetching && !current.data,
    isRefreshing: current.isFetching && !!current.data,
    noResults: hasAny && entries.length === 0,
    onAddPress: scope.guard(() => openModal("investment_asset")),
    onConfirmMaturity: scope.guard((id: string) =>
      openModal("investment_fixed_income_redeem", {
        assetId: id,
        date: pendingAssets.find((asset) => asset.id === id)?.fixedIncome
          ?.maturityDate,
        kind: "TOTAL",
      }),
    ),
    onOwnerFilterChange: setOwnerFilter,
    onQuotesRefresh: quoteRefresh.onRefresh,
    onRefresh: refetch,
    onRetry: refetch,
    onRowPress: (id: string) => router.push(`/investments/asset/${id}`),
    onSearchChange: setSearch,
    onSuggestionsPress: () => router.push("/investments/suggestions"),
    onTabChange: (value: string) => setTab(value as InvestmentAssetStatus),
    onToastHide: scope.onToastHide,
    ownerChoices: buildOwnerFilterChoices(owners),
    ownerFilter,
    pendingAssets: tab === InvestmentAssetStatus.ACTIVE ? pendingAssets : [],
    quotesDisabled: quoteRefresh.disabled,
    quotesRefreshing: quoteRefresh.isRefreshing,
    quotesSecondsLeft: quoteRefresh.secondsLeft,
    quotesSourceDown: quoteRefresh.sourceDown,
    quotesTime: latestQuoteTime(activeAssets),
    readOnly: scope.readOnly,
    search,
    // Incomes (their own request) plus the events the asset list already counts (spec 108 FR 32).
    suggestionsCount:
      (suggestions.data ?? 0) +
      (active.data?.assets ?? []).reduce(
        (sum, asset) => sum + asset.pendingEventSuggestions,
        0,
      ),
    tab,
    toastVisible: scope.toastVisible,
  };
}
