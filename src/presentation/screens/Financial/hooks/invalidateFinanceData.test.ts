import { financeKeys } from "@application/queryKeys/financeKeys";
import {
  invalidateFetcherData,
  markFetcherDataStale,
} from "@infrastructure/fetcher";

import invalidateFinanceData from "./invalidateFinanceData";

jest.mock("@infrastructure/fetcher");

it("SHOULD invalidate every cache a finance write can change, one key prefix each", async () => {
  await invalidateFinanceData();

  const keys = jest
    .mocked(invalidateFetcherData)
    .mock.calls.map(([prefix]) => prefix);

  expect(keys).toEqual(financeKeys.invalidationRoots());
  keys.forEach((prefix) => expect(prefix).toHaveLength(2));
});

it("SHOULD only mark the caches stale WHEN asked not to refetch now (a write made in a modal over the screen)", async () => {
  jest.clearAllMocks();

  await invalidateFinanceData({ refetch: false });

  expect(invalidateFetcherData).not.toHaveBeenCalled();
  expect(markFetcherDataStale).toHaveBeenCalledWith(
    financeKeys.transactions.all(),
  );
  expect(markFetcherDataStale).toHaveBeenCalledWith(financeKeys.summary.all());
});
