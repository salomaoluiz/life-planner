import refetchStaleFetcherData from "./refetchStale";

jest.unmock("@tanstack/react-query");

const { queryClient } = jest.requireActual("./reactQuery/provider");

async function flush() {
  await jest.advanceTimersByTimeAsync(0);
}

function seed(key: string[], fetch: jest.Mock, options = {}) {
  const observer = jest.requireActual("@tanstack/react-query").QueryObserver;
  const unsubscribe = new observer(queryClient, {
    queryFn: fetch,
    queryKey: key,
    ...options,
  }).subscribe(() => undefined);

  return unsubscribe as () => void;
}

beforeEach(() => {
  queryClient.clear();
});

it("SHOULD NOT refetch a fresh query", async () => {
  const fetch = jest.fn().mockResolvedValue("a");
  const unsubscribe = seed(["fresh"], fetch, { staleTime: 60000 });
  await flush();

  await refetchStaleFetcherData([["fresh"]]);

  expect(fetch).toHaveBeenCalledTimes(1);
  unsubscribe();
});

it("SHOULD refetch an active stale query", async () => {
  const fetch = jest.fn().mockResolvedValue("a");
  const unsubscribe = seed(["stale"], fetch, { staleTime: 0 });
  await flush();

  await refetchStaleFetcherData([["stale"]]);

  expect(fetch).toHaveBeenCalledTimes(2);
  unsubscribe();
});

it("SHOULD NOT refetch a disabled query", async () => {
  const fetch = jest.fn().mockResolvedValue("a");
  const unsubscribe = seed(["disabled"], fetch, { enabled: false });
  await flush();

  await refetchStaleFetcherData([["disabled"]]);

  expect(fetch).not.toHaveBeenCalled();
  unsubscribe();
});

it("SHOULD join a fetch that is already running", async () => {
  const fetch = jest.fn().mockResolvedValue("a");
  const unsubscribe = seed(["running"], fetch, { staleTime: 0 });

  await refetchStaleFetcherData([["running"]]);

  expect(fetch).toHaveBeenCalledTimes(1);
  unsubscribe();
});
