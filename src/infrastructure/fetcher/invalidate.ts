import { queryClient } from "@infrastructure/fetcher/reactQuery";

const MAX_SETTLE_ROUNDS = 5;

// Marks cached server state stale and refetches the active queries (unlike reset, keeps the data meanwhile).
// With a cacheKey only the queries under that key prefix are affected; without one, everything is.
// With a cacheKey it also resolves only once those queries stopped fetching: a refetch started by someone else (the
// screen regaining focus) cancels the invalidation's own refetch, and the cancelled invalidation resolves at once with
// the old data still cached. Joining the fetch that is running (cancelRefetch: false) waits for the data to land.
async function invalidateFetcherData(cacheKey?: string[]) {
  if (!cacheKey) {
    return queryClient.invalidateQueries();
  }
  await queryClient.invalidateQueries({ queryKey: cacheKey });
  for (
    let round = 0;
    round < MAX_SETTLE_ROUNDS && queryClient.isFetching({ queryKey: cacheKey });
    round += 1
  ) {
    await queryClient.refetchQueries(
      { queryKey: cacheKey, type: "active" },
      { cancelRefetch: false },
    );
  }
}

export default invalidateFetcherData;
