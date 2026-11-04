import { queryClient } from "@infrastructure/fetcher/reactQuery";

import { getCachedFetcherData, updateCachedFetcherData } from "./cachedData";

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

describe("updateCachedFetcherData", () => {
  it("SHOULD rewrite the data of every cached query under the prefix, skipping the empty ones", () => {
    jest.spyOn(queryClient, "getQueriesData").mockReturnValue([
      [["list", "2026-10"], { n: 1 }],
      [["list", "2026-11"], undefined],
    ]);
    const setQueryData = jest.spyOn(queryClient, "setQueryData");
    const update = jest.fn((data: { n: number }) => ({ n: data.n + 1 }));

    updateCachedFetcherData<{ n: number }>(["list"], update);

    expect(setQueryData).toHaveBeenCalledTimes(1);
    expect(setQueryData).toHaveBeenCalledWith(["list", "2026-10"], { n: 2 });
    expect(update).toHaveBeenCalledWith({ n: 1 }, ["list", "2026-10"]);
  });
});
