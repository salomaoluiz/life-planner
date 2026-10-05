import { CacheStringKeys } from "./keys";

// The financial cache stores the API JSON shape (cents, camelCase): the keys are versioned so
// entries written by the Supabase-era build are never parsed by the new models. The stock cache
// also stores the API shape (camelCase, no status).
it.each([
  ["CACHE_FINANCIAL_ACCOUNT_DATA", "@cache_financial_account_data_v2"],
  ["CACHE_FINANCIAL_CATEGORY_DATA", "@cache_financial_category_data_v2"],
  ["CACHE_FINANCIAL_TRANSACTION_DATA", "@cache_financial_transaction_data_v2"],
  ["CACHE_STOCK_DATA", "@cache_stock_data_v2"],
] as const)("SHOULD have the versioned key %s", (name, value) => {
  expect(CacheStringKeys[name]).toBe(value);
});
