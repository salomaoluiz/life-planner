import { queryClient } from "@infrastructure/fetcher/reactQuery";

import prefetchFetcherData from "./prefetch";

beforeEach(() => {
  jest.restoreAllMocks();
});

it("SHOULD prefetch the key with the fetch function, without persisting anything", async () => {
  const prefetchQuery = jest
    .spyOn(queryClient, "prefetchQuery")
    .mockResolvedValue(undefined);
  const fetch = jest.fn().mockResolvedValue("data");

  await prefetchFetcherData({ cacheKey: ["list", "2026-10"], fetch });

  expect(prefetchQuery).toHaveBeenCalledWith({
    queryFn: fetch,
    queryKey: ["list", "2026-10"],
  });
});
