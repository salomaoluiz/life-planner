import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Marks all cached server state stale and refetches the active queries (unlike reset, keeps the data meanwhile).
async function invalidateFetcherData() {
  return queryClient.invalidateQueries();
}

export default invalidateFetcherData;
