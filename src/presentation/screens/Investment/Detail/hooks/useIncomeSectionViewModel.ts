import { useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import { InvestmentProjectedIncome } from "@domain/entities/investment/InvestmentEntities";
import { useQuery } from "@infrastructure/fetcher";
import useIncomeSuggestionActions from "@screens/Investment/Income/hooks/useIncomeSuggestionActions";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

const PROJECTED_PER_SERIES = 3;

export type IncomeFilter = "ALL" | InvestmentIncomeStatus;
export type IncomeSectionVM = ReturnType<typeof useIncomeSectionViewModel>;

export default useIncomeSectionViewModel;

// The next 3 occurrences of every series of the asset.
function projectedOf(items: InvestmentProjectedIncome[], assetId: string) {
  const seen = new Map<string, number>();

  return items
    .filter((item) => item.assetId === assetId)
    .filter((item) => {
      const count = seen.get(item.seriesId) ?? 0;

      seen.set(item.seriesId, count + 1);

      return count < PROJECTED_PER_SERIES;
    });
}

// Spec 107 section 8: the "Proventos" section of the asset detail (pending suggestions, summary, filtered list).
function useIncomeSectionViewModel(assetId: string) {
  const { openModal } = useModalNavigation();
  const [filter, setFilter] = useState<IncomeFilter>("ALL");
  const suggestionActions = useIncomeSuggestionActions();
  const incomes = useQuery({
    cacheKey: [...investmentKeys.all(), "incomes", assetId, filter],
    fetch: async () =>
      useCases.getInvestmentIncomesUseCase.execute({
        assetId,
        limit: 50,
        status: filter === "ALL" ? undefined : filter,
      }),
  });
  // Spec 115: the series of the asset and the next occurrences the API projects (the next 3 of each series).
  const series = useQuery({
    cacheKey: [...investmentKeys.all(), "income-series-list", assetId],
    fetch: async () =>
      useCases.getInvestmentIncomeSeriesUseCase.execute(assetId),
  });
  const today = todayCalendarDate(new Date());
  const projections = useQuery({
    cacheKey: [...investmentKeys.all(), "income-projections", assetId],
    enabled: (series.data ?? []).some((item) => !item.endedAt),
    fetch: async () =>
      useCases.getInvestmentIncomeSeriesProjectionsUseCase.execute({
        from: today,
        to: todayCalendarDate(
          new Date(new Date().getFullYear() + 2, new Date().getMonth(), 28),
        ),
      }),
  });
  const seriesList = series.data ?? [];
  const projected = projectedOf(projections.data ?? [], assetId);
  const suggestions = useQuery({
    cacheKey: [...investmentKeys.all(), "income-suggestions", assetId],
    fetch: async () =>
      useCases.getInvestmentIncomeSuggestionsUseCase.execute({ assetId }),
  });

  return {
    filter,
    isLoading: incomes.isFetching && !incomes.data,
    items: incomes.data?.items ?? [],
    onAdd: () => openModal("investment_income", { assetId }),
    onEdit: (id: string) => openModal("investment_income", { assetId, id }),
    onEditSeries: (seriesId: string) =>
      openModal("investment_income", { seriesId }),
    onFilterChange: (value: string) => setFilter(value as IncomeFilter),
    onReceive: (id: string) => openModal("investment_income_receive", { id }),
    projected,
    series: seriesList,
    seriesById: new Map(seriesList.map((item) => [item.id, item])),
    suggestionActions,
    suggestions: suggestions.data ?? [],
    summary: incomes.data?.summary,
    today,
  };
}
