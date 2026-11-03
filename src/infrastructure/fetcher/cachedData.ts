import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Read-only: the data of every cached query under the cache key prefix (never fetches).
function getCachedFetcherData<T>(cacheKey: string[]): T[] {
  return queryClient
    .getQueriesData<T>({ queryKey: cacheKey })
    .map(([, data]) => data)
    .filter((data): data is T => data !== undefined);
}

export { getCachedFetcherData };
