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
import {
  buildEntries,
  filterAssets,
} from "@screens/Investment/models/assetList";
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

  async function refetch() {
    await Promise.all([active.refetch(), archived.refetch()]);
  }

  return {
    archivedCount: rowsByTab[InvestmentAssetStatus.ARCHIVED].length,
    assetsCount: rowsByTab[InvestmentAssetStatus.ACTIVE].length,
    entries,
    errorMessage: current.error?.message,
    hasAny,
    isEmpty: !!current.data && !hasAny,
    isLoading: current.isFetching && !current.data,
    isRefreshing: current.isFetching && !!current.data,
    noResults: hasAny && entries.length === 0,
    onAddPress: scope.guard(() => openModal("investment_asset")),
    onOwnerFilterChange: setOwnerFilter,
    onRefresh: refetch,
    onRetry: refetch,
    onRowPress: (id: string) => router.push(`/investments/${id}`),
    onSearchChange: setSearch,
    onTabChange: (value: string) => setTab(value as InvestmentAssetStatus),
    onToastHide: scope.onToastHide,
    ownerChoices: buildOwnerFilterChoices(owners),
    ownerFilter,
    readOnly: scope.readOnly,
    search,
    tab,
    toastVisible: scope.toastVisible,
  };
}
