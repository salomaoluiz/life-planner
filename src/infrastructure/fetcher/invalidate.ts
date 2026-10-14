import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Marks cached server state stale and refetches the active queries (unlike reset, keeps the data meanwhile).
// With a cacheKey only the queries under that key prefix are affected; without one, everything is.
async function invalidateFetcherData(cacheKey?: string[]) {
  return cacheKey
    ? queryClient.invalidateQueries({ queryKey: cacheKey })
    : queryClient.invalidateQueries();
}

export default invalidateFetcherData;
