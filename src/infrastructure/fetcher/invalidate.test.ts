import { queryClient } from "@infrastructure/fetcher/reactQuery";

import invalidateFetcherData from "./invalidate";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD invalidate all queries so mounted screens refetch", async () => {
  const spy = jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

  await invalidateFetcherData();

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith();
});

it("SHOULD invalidate only the queries under the given cache key", async () => {
  const spy = jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

  await invalidateFetcherData(["accounts"]);

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith({ queryKey: ["accounts"] });
});

// A refetch started by someone else (e.g. the screen regaining focus) cancels the invalidation's own refetch, and the
// cancelled invalidation resolves at once with the old data still cached. The caller must wait for the data to land.
it("SHOULD wait for the queries under the key to stop fetching before resolving", async () => {
  jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
  const fetching = jest.spyOn(queryClient, "isFetching");
  const refetch = jest.spyOn(queryClient, "refetchQueries");
  let landed = false;

  fetching.mockImplementation(() => (landed ? 0 : 1));
  refetch.mockImplementation(async () => {
    landed = true;
  });

  await invalidateFetcherData(["accounts"]);

  expect(landed).toBe(true);
  expect(refetch).toHaveBeenCalledWith(
    { queryKey: ["accounts"], type: "active" },
    { cancelRefetch: false },
  );
});

it("SHOULD give up waiting after a few rounds so a query that never settles cannot hang the caller", async () => {
  jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
  jest.spyOn(queryClient, "isFetching").mockReturnValue(1);
  const refetch = jest.spyOn(queryClient, "refetchQueries").mockResolvedValue();

  await invalidateFetcherData(["accounts"]);

  expect(refetch).toHaveBeenCalledTimes(5);
});
