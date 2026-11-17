import { useEffect, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { QuoteRefreshTooSoon } from "@domain/entities/errors";
import {
  InvestmentMarketIndex,
  InvestmentMarketIndexes,
} from "@domain/entities/investment/InvestmentEntities";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import useMarketIndexes from "@screens/Investment/hooks/useMarketIndexes";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  isEmptyIndexes,
  staleNotice,
  updatedWhen,
} from "../models/settingsModel";

export type InvestmentSettingsVM = ReturnType<
  typeof useInvestmentSettingsViewModel
>;

export default useInvestmentSettingsViewModel;

// Spec 113 FR 20-25: the stored indexes, "Refresh now" (1 per minute) and the history of each index.
function useInvestmentSettingsViewModel() {
  const { openModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const query = useMarketIndexes();
  const [toastVisible, setToastVisible] = useState(false);
  const refresh = useMutation<void, InvestmentMarketIndexes>({
    cacheKey: [useCases.refreshInvestmentMarketIndexesUseCase.uniqueName],
    fetch: useCases.refreshInvestmentMarketIndexesUseCase.execute,
  });
  const { error, reset, status } = refresh;

  useEffect(() => {
    if (status === "success") {
      void invalidateFetcherData(investmentKeys.all());
      reset();
    }
  }, [status, reset]);

  useEffect(() => {
    if (error instanceof QuoteRefreshTooSoon) {
      setToastVisible(true);
      reset();
    }
  }, [error, reset]);

  const data = query.data;

  return {
    data,
    isEmpty: !!data && isEmptyIndexes(data),
    isError: query.status === "error" && !data,
    isLoading: query.status === "pending" && !data,
    notice: data ? staleNotice(data, localeTag) : null,
    onOpenHistory: (index: InvestmentMarketIndex) =>
      openModal("investment_index_history", { index }),
    onRefresh() {
      if (!refresh.isFetching) {
        refresh.mutate();
      }
    },
    onRetry: async () => query.refetch(),
    onToastHide: () => setToastVisible(false),
    refreshing: refresh.isFetching,
    toastVisible,
    updated: updatedWhen(data?.lastSuccessAt ?? null, new Date(), localeTag),
  };
}
