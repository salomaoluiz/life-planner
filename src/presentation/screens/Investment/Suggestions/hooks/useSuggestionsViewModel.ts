import { router } from "expo-router";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { useQuery } from "@infrastructure/fetcher";
import useIncomeSuggestionActions from "@screens/Investment/Income/hooks/useIncomeSuggestionActions";

export type SuggestionsVM = ReturnType<typeof useSuggestionsViewModel>;

export default useSuggestionsViewModel;

// Spec 107 section 8: the inbox of announced income across every readable asset (stored suggestions, no provider call).
function useSuggestionsViewModel() {
  const actions = useIncomeSuggestionActions();
  const query = useQuery({
    cacheKey: [...investmentKeys.all(), "income-suggestions", "all"],
    fetch: async () =>
      useCases.getInvestmentIncomeSuggestionsUseCase.execute({}),
  });
  const items = query.data ?? [];

  return {
    actions,
    count: items.length,
    errorMessage: query.error?.message,
    isEmpty: !!query.data && items.length === 0,
    isLoading: query.isFetching && !query.data,
    items,
    onBack: () => router.replace("/investments"),
    onRetry: async () => query.refetch(),
    today: todayCalendarDate(new Date()),
  };
}
