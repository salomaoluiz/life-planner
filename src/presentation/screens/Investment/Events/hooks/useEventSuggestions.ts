import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

export default useEventSuggestions;

// Spec 108 FR 33: the pending suggestions of an asset (stored rows, no provider call). Shared by the banner and the
// section, which React Query serves from one request.
function useEventSuggestions(assetId: string) {
  const query = useQuery({
    cacheKey: [...investmentKeys.all(), "event-suggestions", assetId],
    fetch: async () =>
      useCases.getInvestmentEventSuggestionsUseCase.execute({ assetId }),
  });

  return query.data ?? [];
}
