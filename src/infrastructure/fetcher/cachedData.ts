import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Read-only: the data of every cached query under the cache key prefix (never fetches).
function getCachedFetcherData<T>(cacheKey: string[]): T[] {
  return queryClient
    .getQueriesData<T>({ queryKey: cacheKey })
    .map(([, data]) => data)
    .filter((data): data is T => data !== undefined);
}

// Rewrites the data of every cached query under the prefix (queries without data are skipped). The update shows at
// once; mark the queries stale (invalidate) when the server may hold more than the patch.
function updateCachedFetcherData<T>(
  cacheKey: string[],
  update: (data: T, queryKey: readonly unknown[]) => T,
) {
  queryClient
    .getQueriesData<T>({ queryKey: cacheKey })
    .forEach(([queryKey, data]) => {
      if (data !== undefined) {
        queryClient.setQueryData<T>(queryKey, update(data, queryKey));
      }
    });
}

export { getCachedFetcherData, updateCachedFetcherData };
