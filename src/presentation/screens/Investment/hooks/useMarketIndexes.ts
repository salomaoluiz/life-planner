import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentMarketIndexes } from "@domain/entities/investment/InvestmentEntities";
import { useQuery } from "@infrastructure/fetcher";

// Spec 113 FR 23: the stored CDI, Selic and IPCA, read once with a key shared by the Settings screen, the rate form
// and the title detail (React Query dedupes the request).
function useMarketIndexes(enabled = true) {
  return useQuery<InvestmentMarketIndexes>({
    cacheKey: investmentKeys.marketIndexes(),
    enabled,
    fetch: async () => useCases.getInvestmentMarketIndexesUseCase.execute(),
  });
}

export default useMarketIndexes;
