import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentMarketIndex } from "@domain/entities/investment/InvestmentEntities";
import { useQuery } from "@infrastructure/fetcher";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import { HistoryPeriod, historyRange } from "../models/historyModel";

export type IndexHistoryVM = ReturnType<typeof useIndexHistoryViewModel>;

const INDEXES: InvestmentMarketIndex[] = ["CDI", "SELIC", "IPCA"];

export default useIndexHistoryViewModel;

// Spec 113 FR 22: the history of one index (`?index=CDI|SELIC|IPCA`) over a period, its changes and its followers.
function useIndexHistoryViewModel() {
  const { closeModal } = useModalNavigation();
  const params = useLocalSearchParams<{ index?: string }>();
  const index = INDEXES.find((item) => item === params.index) ?? "CDI";
  const [period, setPeriod] = useState<HistoryPeriod>("12m");
  const { from, to } = historyRange(period, toDateKey(new Date()));
  const query = useQuery({
    cacheKey: investmentKeys.marketIndexHistory(index, from, to),
    fetch: async () =>
      useCases.getInvestmentMarketIndexHistoryUseCase.execute({
        from,
        index,
        to,
      }),
    keepPreviousData: true,
  });

  return {
    history: query.data,
    index,
    isError: query.status === "error" && !query.data,
    isLoading: query.status === "pending" && !query.data,
    onAssetPress(assetId: string) {
      closeModal();
      router.push(`/investments/asset/${assetId}`);
    },
    onClose: closeModal,
    onPeriodChange: (value: string) => setPeriod(value as HistoryPeriod),
    onRetry: async () => query.refetch(),
    period,
  };
}
