import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import {
  InvestmentAssetStatus,
  InvestmentOperationType,
  InvestmentPriceRange,
  InvestmentPriceSource,
} from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentPriceHistory,
} from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import useQuoteRefresh from "@screens/Investment/hooks/useQuoteRefresh";
import {
  formatDay,
  formatMoney,
  formatQuantity,
} from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import { canConvert, conversionDeleteSummary } from "../models/conversionModel";
import { deleteSummary, sellCount } from "../models/detailModel";
import { FixedIncomeTab } from "../models/fixedIncomeTab";
import { ChartMode } from "../models/priceChart";

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
  const [fixedIncomeMenuOpen, setFixedIncomeMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Spec 112: the conversion operation whose row menu / delete confirmation is open.
  const [conversionMenuId, setConversionMenuId] = useState<string>();
  const [conversionDeleteId, setConversionDeleteId] = useState<string>();
  const [range, setRange] = useState(InvestmentPriceRange.ONE_YEAR);
  const [chartMode, setChartMode] = useState<ChartMode>("price");
  const [fixedIncomeTab, setFixedIncomeTab] = useState<FixedIncomeTab>("lots");
  const quoteRefresh = useQuoteRefresh([id]);
  const localeTag = useLocaleTag();

  const query = useOwnerScopedQuery<DetailData>({
    cacheKey: investmentKeys.asset(id),
    fetch: async (owners) => ({
      asset: await useCases.getInvestmentAssetUseCase.execute(id),
      owners,
    }),
  });
  const history = useOwnerScopedQuery<InvestmentPriceHistory>({
    cacheKey: investmentKeys.priceHistory(id, range),
    fetch: async () =>
      useCases.getInvestmentPriceHistoryUseCase.execute({ id, range }),
  });
  const accounts = useOwnerScopedQuery<AccountDTO[]>({
    cacheKey: financeKeys.accounts.raw("investment"),
    fetch: async (owners) =>
      useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
  });

  const conversionDelete = useMutation({
    cacheKey: [useCases.deleteInvestmentConversionUseCase.uniqueName],
    fetch: useCases.deleteInvestmentConversionUseCase.execute,
  });
  const archiveMutation = useMutation({
    cacheKey: [useCases.updateInvestmentAssetUseCase.uniqueName],
    fetch: useCases.updateInvestmentAssetUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentAssetUseCase.uniqueName],
    fetch: useCases.deleteInvestmentAssetUseCase.execute,
  });
  // Spec 105: the rates and the operations of a calculated title are deleted from its tabs.
  const rateMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentFixedIncomeRateUseCase.uniqueName],
    fetch: useCases.deleteInvestmentFixedIncomeRateUseCase.execute,
  });
  const operationMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentOperationUseCase.uniqueName],
    fetch: useCases.deleteInvestmentOperationUseCase.execute,
  });
  const valuationMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentValuationUseCase.uniqueName],
    fetch: useCases.deleteInvestmentValuationUseCase.execute,
  });

  const asset = query.data?.asset;
  const menuOperation = asset?.operations.find(
    (operation) => operation.id === conversionMenuId,
  );
  const deleteOperation = asset?.operations.find(
    (operation) => operation.id === conversionDeleteId,
  );
  // The destination of an origin row says which later conversion locks it (FR 19).
  const lockedBy = useQuery({
    cacheKey: [
      ...investmentKeys.all(),
      "conversion-locked",
      conversionMenuId ?? "",
    ],
    enabled:
      !!menuOperation?.conversion?.locked &&
      menuOperation.type === InvestmentOperationType.CONVERSION_OUT,
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(
        menuOperation!.conversion!.assetId,
      ),
  });
  // What deleting the conversion removes (the destination's fraction sale) and the positions after.
  const deleteInfo = useQuery({
    cacheKey: [
      ...investmentKeys.all(),
      "conversion-delete",
      conversionDeleteId ?? "",
    ],
    enabled: !!deleteOperation?.conversion,
    fetch: async () => {
      const conversion = await useCases.getInvestmentConversionUseCase.execute(
        deleteOperation!.conversion!.conversionId,
      );
      const origin =
        conversion.from.assetId === id
          ? asset!
          : await useCases.getInvestmentAssetUseCase.execute(
              conversion.from.assetId,
            );
      const destination =
        conversion.to.assetId === id
          ? asset!
          : await useCases.getInvestmentAssetUseCase.execute(
              conversion.to.assetId,
            );

      return conversionDeleteSummary(conversion, destination, origin);
    },
  });
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
      history.refetch();
    }
  }, [isFocused]);

  // "Open operation" from a finance row (spec 102 FR 39): the operation modal opens once over the detail.
  useEffect(() => {
    if (
      params.operation &&
      asset?.operations.some((operation) => operation.id === params.operation)
    ) {
      openOperation(params.operation);
      router.setParams({ operation: undefined });
    }
  }, [params.operation, asset?.id]);

  // A fraction sale (spec 108) has its own modal; every other operation opens the operation form.
  function openOperation(operationId: string) {
    const fraction = asset?.operations.find(
      (operation) => operation.id === operationId,
    )?.fractionOfOperationId;

    if (fraction) {
      openModal("investment_fraction_sale", {
        assetId: id,
        eventId: fraction,
        id: operationId,
      });
    } else {
      openModal("investment_operation", { assetId: id, id: operationId });
    }
  }

  useEffect(() => {
    if (archiveMutation.status === "success") {
      void invalidateInvestments();
      archiveMutation.reset();
    }
  }, [archiveMutation.status]);

  useEffect(() => {
    if (rateMutation.status === "success") {
      void invalidateInvestments();
      rateMutation.reset();
    }
  }, [rateMutation.status]);

  useEffect(() => {
    if (operationMutation.status === "success") {
      void invalidateInvestments();
      operationMutation.reset();
    }
  }, [operationMutation.status]);

  useEffect(() => {
    if (valuationMutation.status === "success") {
      void invalidateInvestments();
      valuationMutation.reset();
    }
  }, [valuationMutation.status]);

  useEffect(() => {
    if (conversionDelete.status === "success") {
      setConversionDeleteId(undefined);
      void invalidateInvestments();
      conversionDelete.reset();
    }
  }, [conversionDelete.status]);

  useEffect(() => {
    if (deleteMutation.status === "success") {
      void invalidateInvestments();
      router.replace("/investments");
    }
  }, [deleteMutation.status]);

  const ownerLabel = ownerLabelOf(asset, query.data?.owners ?? []);
  const summary = asset ? deleteSummary(asset) : { entries: 0, operations: 0 };
  const error =
    archiveMutation.error ??
    conversionDelete.error ??
    deleteMutation.error ??
    valuationMutation.error ??
    rateMutation.error ??
    operationMutation.error;

  // Spec 112 FR 19: an origin names the later conversion of its destination, a destination its own.
  function lockedHint() {
    if (!menuOperation?.conversion?.locked) {
      return undefined;
    }

    const later =
      menuOperation.type === InvestmentOperationType.CONVERSION_OUT
        ? lockedBy.data?.convertedTo
        : asset?.convertedTo;

    return later
      ? {
          date: formatDay(later.date, localeTag),
          from: menuOperation.conversion.ticker ?? "",
          to: later.ticker ?? "",
        }
      : undefined;
  }

  // The origin of a conversion row: this asset on the OUT, the counterpart on the IN.
  function originOf(operation: {
    conversion?: { assetId: string };
    type: string;
  }) {
    return operation.type === InvestmentOperationType.CONVERSION_OUT
      ? id
      : (operation.conversion?.assetId ?? id);
  }

  async function onConversionSellFraction() {
    const conversionId = menuOperation?.conversion?.conversionId;

    setConversionMenuId(undefined);

    if (conversionId) {
      const conversion =
        await useCases.getInvestmentConversionUseCase.execute(conversionId);

      openModal("investment_fraction_sale", {
        assetId: conversion.to.assetId,
        eventId: conversion.to.operationId,
      });
    }
  }

  function deleteLines() {
    const summary = deleteInfo.data;
    const ticker = deleteOperation?.conversion?.ticker ?? "";
    const currency = asset?.currency ?? "BRL";
    const lines: { key: TranslationKeys; params?: Record<string, string> }[] =
      [];

    if (!summary) {
      return { after: lines, also: lines };
    }

    const also = [...lines];

    if (summary.sale) {
      also.push({
        key: "investment.conversion.deleteSale",
        params: {
          amount: formatMoney(summary.sale.amount, currency, localeTag),
          date: formatDay(summary.sale.date, localeTag),
          quantity: formatQuantity(summary.sale.quantity, localeTag),
          ticker,
        },
      });
    }
    if (summary.saleHasEntry) {
      also.push({ key: "investment.conversion.deleteSaleEntry" });
    }
    if (summary.cashEntry) {
      also.push({ key: "investment.conversion.deleteCashEntry" });
    }

    return {
      after: [
        {
          key: "investment.conversion.deleteAfterOrigin" as const,
          params: {
            quantity: formatQuantity(summary.originAfter.quantity, localeTag),
            ticker:
              deleteOperation?.type === InvestmentOperationType.CONVERSION_OUT
                ? (asset?.ticker ?? "")
                : ticker,
          },
        },
        {
          key: "investment.conversion.deleteAfterDestination" as const,
          params: {
            cost: formatMoney(
              summary.destinationAfter.cost,
              currency,
              localeTag,
            ),
            quantity: formatQuantity(
              summary.destinationAfter.quantity,
              localeTag,
            ),
            ticker:
              deleteOperation?.type === InvestmentOperationType.CONVERSION_OUT
                ? ticker
                : (asset?.ticker ?? ""),
          },
        },
      ],
      also,
    };
  }

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
    canConvert: !!asset && canConvert(asset),
    chartMode,
    conversionDelete: {
      ...deleteLines(),
      fromTicker:
        deleteOperation?.type === InvestmentOperationType.CONVERSION_OUT
          ? (asset?.ticker ?? "")
          : (deleteOperation?.conversion?.ticker ?? ""),
      isLoading: deleteInfo.isFetching && !deleteInfo.data,
      isOpen: !!deleteOperation,
      isSaving: conversionDelete.isFetching,
      toTicker:
        deleteOperation?.type === InvestmentOperationType.CONVERSION_OUT
          ? (deleteOperation?.conversion?.ticker ?? "")
          : (asset?.ticker ?? ""),
    },
    conversionMenu: {
      canSellFraction:
        !!menuOperation &&
        (menuOperation.type === InvestmentOperationType.CONVERSION_OUT ||
          !!asset?.position.pendingFractions.some(
            (fraction) => fraction.eventId === menuOperation.id,
          )),
      isOpen: !!menuOperation,
      locked: menuOperation?.conversion?.locked === true,
      lockedHint: lockedHint(),
    },
    deleteSummary: summary,
    errorMessage: getInvestmentErrorMessage(error, (day) =>
      formatDay(day, localeTag),
    ),
    fixedIncome: asset?.fixedIncome ?? null,
    fixedIncomeMenuOpen,
    fixedIncomeTab,
    history: history.data,
    historyLoading: history.isFetching && !history.data,
    isDeleteOpen: deleteOpen,
    isDeleting: deleteMutation.isFetching,
    isLoading: query.isFetching && !query.data,
    isMenuOpen: menuOpen,
    isNotFound: !!query.error && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    manualOverQuote:
      asset?.priceSource === InvestmentPriceSource.MANUAL && !!asset.quote,
    onAddOperation: scope.guard(() =>
      openModal("investment_operation", { assetId: id }),
    ),
    onAdjust: scope.guard(() =>
      openModal("investment_fixed_income_adjust", { assetId: id }),
    ),
    onArchiveToggle: scope.guard(onArchiveToggle),
    onBack: () => router.replace("/investments"),
    onBackToAutomatic: scope.guard(() => {
      const manual = asset?.valuations[0];

      if (manual) {
        valuationMutation.mutate(manual.id);
      }
    }),
    onChartModeChange: setChartMode,
    onConfirmMaturity: scope.guard(() =>
      openModal("investment_fixed_income_redeem", {
        assetId: id,
        date: asset?.fixedIncome?.maturityDate,
        kind: "TOTAL",
      }),
    ),
    onContribute: scope.guard(() =>
      openModal("investment_fixed_income_contribution", { assetId: id }),
    ),
    onConversionDeleteCancel: () => setConversionDeleteId(undefined),
    onConversionDeleteConfirm: () => {
      const conversionId = deleteOperation?.conversion?.conversionId;

      if (conversionId) {
        conversionDelete.mutate(conversionId);
      }
    },
    onConversionDeleteOpen: scope.guard(() => {
      setConversionDeleteId(conversionMenuId);
      setConversionMenuId(undefined);
    }),
    onConversionEdit: scope.guard(() => {
      if (menuOperation?.conversion) {
        openModal("investment_conversion", {
          assetId: originOf(menuOperation),
          id: menuOperation.conversion.conversionId,
        });
      }

      setConversionMenuId(undefined);
    }),
    onConversionMenuClose: () => setConversionMenuId(undefined),
    onConversionMenuOpen: setConversionMenuId,
    onConversionSellFraction: scope.guard(onConversionSellFraction),
    onConversionStart: scope.guard(() => {
      setMenuOpen(false);
      openModal("investment_conversion", { assetId: id });
    }),
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
    onFixedIncomeMenuClose: () => setFixedIncomeMenuOpen(false),
    onFixedIncomeMore: () => setFixedIncomeMenuOpen(true),
    onFixedIncomeOperationDelete: scope.guard((operationId: string) =>
      operationMutation.mutate(operationId),
    ),
    onFixedIncomeTabChange: (value: string) =>
      setFixedIncomeTab(value as FixedIncomeTab),
    onMenuClose: () => setMenuOpen(false),
    onMenuOpen: () => setMenuOpen(true),
    onOpenAsset: (assetId: string) =>
      router.push(`/investments/asset/${assetId}` as never),
    onOperationPress: openOperation,
    onQuotesRefresh: quoteRefresh.onRefresh,
    onRangeChange: setRange,
    onRateDelete: scope.guard((rateId: string) => rateMutation.mutate(rateId)),
    onRateEdit: scope.guard((rateId: string) =>
      openModal("investment_fixed_income_rate", { assetId: id, rateId }),
    ),
    onRedeem: scope.guard(() =>
      openModal("investment_fixed_income_redeem", { assetId: id }),
    ),
    onRefresh: async () => query.refetch(),
    onRetry: async () => query.refetch(),
    onSellFraction: scope.guard((eventId: string) =>
      openModal("investment_fraction_sale", { assetId: id, eventId }),
    ),
    onToastHide: scope.onToastHide,
    onUpdateRate: scope.guard(() =>
      openModal("investment_fixed_income_rate", { assetId: id }),
    ),
    onUpdateValue: scope.guard(() =>
      openModal("investment_valuation", { assetId: id }),
    ),
    ownerLabel,
    quotesDisabled: quoteRefresh.disabled,
    quotesRefreshing: quoteRefresh.isRefreshing,
    quotesSecondsLeft: quoteRefresh.secondsLeft,
    quotesSourceDown: quoteRefresh.sourceDown,
    range,
    readOnly: scope.readOnly,
    sellCount: asset ? sellCount(asset) : 0,
    toastVisible: scope.toastVisible,
  };
}
