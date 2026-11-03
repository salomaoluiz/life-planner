import markFetcherDataStale from "./markStale";

jest.unmock("@tanstack/react-query");

const { queryClient } = jest.requireActual("./reactQuery/provider");

beforeEach(() => {
  queryClient.clear();
});

it("SHOULD mark the queries under the key stale WITHOUT refetching them now", async () => {
  const fetch = jest.fn().mockResolvedValue("a");
  const observer = new (jest.requireActual(
    "@tanstack/react-query",
  ).QueryObserver)(queryClient, {
    queryFn: fetch,
    queryKey: ["items", "list"],
    staleTime: 60000,
  });
  const unsubscribe = observer.subscribe(() => undefined);

  await jest.advanceTimersByTimeAsync(0);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(queryClient.getQueryState(["items", "list"]).isInvalidated).toBe(
    false,
  );

  await markFetcherDataStale(["items"]);
  await jest.advanceTimersByTimeAsync(0);

  expect(queryClient.getQueryState(["items", "list"]).isInvalidated).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(1);
  unsubscribe();
});
