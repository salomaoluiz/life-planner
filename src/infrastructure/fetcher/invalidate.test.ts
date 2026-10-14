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
