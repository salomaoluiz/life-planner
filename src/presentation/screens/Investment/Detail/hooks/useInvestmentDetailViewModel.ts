import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import { deleteSummary, sellCount } from "../models/detailModel";

export type InvestmentDetailVM = ReturnType<
  typeof useInvestmentDetailViewModel
>;

interface DetailData {
  asset: InvestmentAssetDetail;
  owners: OwnerDTO[];
}

export default useInvestmentDetailViewModel;

function ownerLabelOf(
  asset: InvestmentAssetDetail | undefined,
  owners: OwnerDTO[],
): string {
  const owner = owners.find((item) => item.id === asset?.ownerId);

  return owner?.type === OwnerType.FAMILY ? owner.name : "";
}

function useInvestmentDetailViewModel() {
  const params = useLocalSearchParams<{ id: string; operation?: string }>();
  const id = params.id;
  const isFocused = useIsFocused();
  const { openModal } = useModalNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const query = useOwnerScopedQuery<DetailData>({
    cacheKey: investmentKeys.asset(id),
    fetch: async (owners) => ({
      asset: await useCases.getInvestmentAssetUseCase.execute(id),
      owners,
    }),
  });
  const accounts = useOwnerScopedQuery<AccountDTO[]>({
    cacheKey: financeKeys.accounts.raw("investment"),
    fetch: async (owners) =>
      useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
  });

  const archiveMutation = useMutation({
    cacheKey: [useCases.updateInvestmentAssetUseCase.uniqueName],
    fetch: useCases.updateInvestmentAssetUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentAssetUseCase.uniqueName],
    fetch: useCases.deleteInvestmentAssetUseCase.execute,
  });
  const valuationMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentValuationUseCase.uniqueName],
    fetch: useCases.deleteInvestmentValuationUseCase.execute,
  });

  const asset = query.data?.asset;
  const scope = useReadOnlyScope(query.data?.owners, asset?.ownerId ?? "");
  const archived = asset?.status === InvestmentAssetStatus.ARCHIVED;
  const accountNames = useMemo(
    () =>
      new Map(
        (accounts.data ?? []).map((account) => [account.id, account.name]),
      ),
    [accounts.data],
  );

  useEffect(() => {
    if (isFocused) {
      query.refetch();
    }
  }, [isFocused]);

  // "Open operation" from a finance row (spec 102 FR 39): the operation modal opens once over the detail.
  useEffect(() => {
    if (
      params.operation &&
      asset?.operations.some((operation) => operation.id === params.operation)
    ) {
      openModal("investment_operation", {
        assetId: id,
        id: params.operation,
      });
      router.setParams({ operation: undefined });
    }
  }, [params.operation, asset?.id]);

  useEffect(() => {
    if (archiveMutation.status === "success") {
      void invalidateInvestments();
      archiveMutation.reset();
    }
  }, [archiveMutation.status]);

  useEffect(() => {
    if (valuationMutation.status === "success") {
      void invalidateInvestments();
      valuationMutation.reset();
    }
  }, [valuationMutation.status]);

  useEffect(() => {
    if (deleteMutation.status === "success") {
      void invalidateInvestments();
      router.replace("/investments");
    }
  }, [deleteMutation.status]);

  const ownerLabel = ownerLabelOf(asset, query.data?.owners ?? []);
  const summary = asset ? deleteSummary(asset) : { entries: 0, operations: 0 };
  const error =
    archiveMutation.error ?? deleteMutation.error ?? valuationMutation.error;

  function onArchiveToggle() {
    setMenuOpen(false);
    archiveMutation.mutate({
      id,
      status: archived
        ? InvestmentAssetStatus.ACTIVE
        : InvestmentAssetStatus.ARCHIVED,
    });
  }

  return {
    accountNames,
    archived,
    archivedAt: asset?.archivedAt ?? null,
    asset,
    deleteSummary: summary,
    errorMessage: getInvestmentErrorMessage(error),
    isDeleteOpen: deleteOpen,
    isDeleting: deleteMutation.isFetching,
    isLoading: query.isFetching && !query.data,
    isMenuOpen: menuOpen,
    isNotFound: !!query.error && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    onAddOperation: scope.guard(() =>
      openModal("investment_operation", { assetId: id }),
    ),
    onArchiveToggle: scope.guard(onArchiveToggle),
    onBack: () => router.replace("/investments"),
    onDeleteCancel: () => setDeleteOpen(false),
    onDeleteConfirm: () => deleteMutation.mutate(id),
    onDeleteOpen: scope.guard(() => {
      setMenuOpen(false);
      setDeleteOpen(true);
    }),
    onDeleteValuation: scope.guard((valuationId: string) =>
      valuationMutation.mutate(valuationId),
    ),
    onEdit: scope.guard(() => {
      setMenuOpen(false);
      openModal("investment_asset", { id });
    }),
    onMenuClose: () => setMenuOpen(false),
    onMenuOpen: () => setMenuOpen(true),
    onOperationPress: (operationId: string) =>
      openModal("investment_operation", { assetId: id, id: operationId }),
    onRefresh: async () => query.refetch(),
    onRetry: async () => query.refetch(),
    onToastHide: scope.onToastHide,
    onUpdateValue: scope.guard(() =>
      openModal("investment_valuation", { assetId: id }),
    ),
    ownerLabel,
    readOnly: scope.readOnly,
    sellCount: asset ? sellCount(asset) : 0,
    toastVisible: scope.toastVisible,
  };
}
