import cache, { CacheStringKeys } from "@infrastructure/cache";

// A split writes rows (and moves balances and invoices): the lists and the accounts change.
function invalidateSplitCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export { invalidateSplitCaches };
