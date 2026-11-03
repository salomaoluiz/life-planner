import { queryClient } from "@infrastructure/fetcher/reactQuery";

// Marks the cached queries under a key prefix stale without refetching them now: the next time a mounted screen
// regains focus (refetchStaleFetcherData) or mounts, it fetches fresh data. For a write made in a modal over the
// screen, whose own refetch should happen once the modal is closed, not while it still closes.
async function markFetcherDataStale(cacheKey: string[]) {
  await queryClient.invalidateQueries({
    queryKey: cacheKey,
    refetchType: "none",
  });
}

export default markFetcherDataStale;
