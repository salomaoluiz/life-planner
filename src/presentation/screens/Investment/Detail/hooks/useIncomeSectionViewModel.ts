import { useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import { useQuery } from "@infrastructure/fetcher";
import useIncomeSuggestionActions from "@screens/Investment/Income/hooks/useIncomeSuggestionActions";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type IncomeFilter = "ALL" | InvestmentIncomeStatus;
export type IncomeSectionVM = ReturnType<typeof useIncomeSectionViewModel>;

export default useIncomeSectionViewModel;

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
    onFilterChange: (value: string) => setFilter(value as IncomeFilter),
    onReceive: (id: string) => openModal("investment_income_receive", { id }),
    suggestionActions,
    suggestions: suggestions.data ?? [],
    summary: incomes.data?.summary,
    today: todayCalendarDate(new Date()),
  };
}
