import { router } from "expo-router";
import { useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { useQuery } from "@infrastructure/fetcher";
import useEventSuggestionActions from "@screens/Investment/Events/hooks/useEventSuggestionActions";
import useIncomeSuggestionActions from "@screens/Investment/Income/hooks/useIncomeSuggestionActions";

export type SuggestionFilter = "ALL" | "EVENT" | "INCOME";
export type SuggestionsVM = ReturnType<typeof useSuggestionsViewModel>;

export default useSuggestionsViewModel;

// Spec 107 section 8 and spec 108: the inbox of announced income and corporate events across every readable asset
// (stored suggestions, no provider call), filtered by the tabs Todas / Proventos / Eventos.
function useSuggestionsViewModel() {
  const [filter, setFilter] = useState<SuggestionFilter>("ALL");
  const actions = useIncomeSuggestionActions();
  const eventActions = useEventSuggestionActions();
  const incomeQuery = useQuery({
    cacheKey: [...investmentKeys.all(), "income-suggestions", "all"],
    fetch: async () =>
      useCases.getInvestmentIncomeSuggestionsUseCase.execute({}),
  });
  const eventQuery = useQuery({
    cacheKey: [...investmentKeys.all(), "event-suggestions", "all"],
    fetch: async () =>
      useCases.getInvestmentEventSuggestionsUseCase.execute({}),
  });
  const income = incomeQuery.data ?? [];
  const events = eventQuery.data ?? [];
  const items = filter === "EVENT" ? [] : income;
  const eventItems = filter === "INCOME" ? [] : events;

  return {
    actions,
    count: income.length + events.length,
    counts: {
      all: income.length + events.length,
      events: events.length,
      income: income.length,
    },
    errorMessage: incomeQuery.error?.message ?? eventQuery.error?.message,
    eventActions,
    eventItems,
    filter,
    isEmpty:
      !!incomeQuery.data &&
      !!eventQuery.data &&
      items.length + eventItems.length === 0,
    isLoading:
      (incomeQuery.isFetching && !incomeQuery.data) ||
      (eventQuery.isFetching && !eventQuery.data),
    items,
    onBack: () => router.replace("/investments"),
    onFilterChange: (value: string) => setFilter(value as SuggestionFilter),
    onRetry: async () => {
      await Promise.all([incomeQuery.refetch(), eventQuery.refetch()]);
    },
    today: todayCalendarDate(new Date()),
  };
}
