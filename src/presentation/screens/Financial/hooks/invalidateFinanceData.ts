import { financeKeys } from "@application/queryKeys/financeKeys";
import {
  invalidateFetcherData,
  markFetcherDataStale,
} from "@infrastructure/fetcher";

// A finance write (a transaction, an invoice payment, an account, a category...) can change many cached screens: lists,
// invoices, balances, summaries, projections, card limits. Data stays fresh for 30 s (spec 073), so a write must mark
// all of them stale itself instead of relying on the next focus or mount. Only the mounted queries refetch at once.
// `refetch: false` only marks them stale: the screen under a modal refetches them when it regains focus, once the modal
// is closed (an immediate refetch while the modal closes raced with the write on the recurrence flows).
// One call per key prefix (`financeKeys.invalidationRoots()`): `invalidateFetcherData([a, b])` would mean the single prefix `a → b`.
async function invalidateFinanceData({ refetch = true } = {}) {
  const invalidate = refetch ? invalidateFetcherData : markFetcherDataStale;

  await Promise.all(
    financeKeys.invalidationRoots().map(async (key) => invalidate(key)),
  );
}

export default invalidateFinanceData;
