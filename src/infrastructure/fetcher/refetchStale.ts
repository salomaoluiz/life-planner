import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Refetches the mounted queries under each cache key prefix whose data is older than their stale time. A query that
// is already fetching is joined (no second request), and a fresh or disabled one is left alone: a screen regaining
// focus calls this instead of refetching everything it shows.
async function refetchStaleFetcherData(cacheKeys: string[][]) {
  await Promise.all(
    cacheKeys.map(async (queryKey) =>
      queryClient.refetchQueries(
        { queryKey, stale: true, type: "active" },
        { cancelRefetch: false },
      ),
    ),
  );
}

export default refetchStaleFetcherData;
