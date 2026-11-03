import { queryClient } from "@infrastructure/fetcher/reactQuery";

import { getCachedFetcherData } from "./cachedData";

beforeEach(() => {
  jest.restoreAllMocks();
});

it("SHOULD read the data of every cached query under the prefix, skipping the empty ones", () => {
  jest.spyOn(queryClient, "getQueriesData").mockReturnValue([
    [["list", "2026-10"], { id: 1 }],
    [["list", "2026-11"], undefined],
  ]);

  expect(getCachedFetcherData(["list"])).toEqual([{ id: 1 }]);
  expect(queryClient.getQueriesData).toHaveBeenCalledWith({
    queryKey: ["list"],
  });
});
