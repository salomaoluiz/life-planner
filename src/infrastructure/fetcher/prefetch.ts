import { queryClient } from "@infrastructure/fetcher/reactQuery";

interface Props<T> {
  cacheKey: string[];
  fetch: () => Promise<T>;
}

// Warms the cache of a query before a screen asks for it. Best effort: a result that is still fresh is not fetched
// again and a failure is dropped (the screen fetches it normally when it needs it).
async function prefetchFetcherData<T>(props: Props<T>) {
  await queryClient.prefetchQuery({
    queryFn: props.fetch,
    queryKey: props.cacheKey,
  });
}

export default prefetchFetcherData;
