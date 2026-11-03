import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

// Family changes made on another device show up after this long (pull to refresh fixes it sooner); family writes on
// this device invalidate the entry.
export const OWNERS_STALE_TIME = 5 * 60 * 1000;

// The owners (personal + families) of the user: one cache entry shared by every owner-filtered screen, so they all
// start their data queries in the same batch as soon as it resolves (spec 074).
function useOwners(options: { enabled?: boolean } = {}) {
  return useQuery<OwnerDTO[]>({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    enabled: options.enabled,
    fetch: useCases.getOwnersUseCase.execute,
    staleTime: OWNERS_STALE_TIME,
  });
}

export default useOwners;
