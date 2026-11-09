import cache, { CacheStringKeys } from "@infrastructure/cache";

// A transfer writes rows on two accounts: the lists and the balances move.
function invalidateTransferCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export { invalidateTransferCaches };
