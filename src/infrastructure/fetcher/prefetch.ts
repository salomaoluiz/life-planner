import { queryClient } from "@infrastructure/fetcher/reactQuery";

import markFetcherDataStale from "./markStale";

interface Props<T> {
  cacheKey: string[];
  fetch: () => Promise<T>;
}

// Warms the cache of a query before a screen asks for it. Best effort: a result that is still fresh is not fetched
// again and a failure is dropped (the screen fetches it normally when it needs it). The warmed data is marked stale:
// the screen that mounts on it shows it at once and revalidates in the background, so a change made elsewhere
// (another device) while it waited is not hidden behind the stale-time window.
async function prefetchFetcherData<T>(props: Props<T>) {
  await queryClient.prefetchQuery({
    queryFn: props.fetch,
    queryKey: props.cacheKey,
  });
  await markFetcherDataStale(props.cacheKey);
}

export default prefetchFetcherData;
