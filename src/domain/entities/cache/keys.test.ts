import { CacheStringKeys } from "./keys";

it("SHOULD have CACHE_FINANCIAL_CATEGORY_DATA key in CacheStringKeys", () => {
  expect(CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA).toBe(
    "@cache_financial_category_data",
  );
});
