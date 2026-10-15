import { CacheStringKeys } from "@infrastructure/cache";

import { setup, spies } from "./mocks/adjustAccountBalance.mocks";

it("SHOULD forward the id and the desired balance to the datasource", async () => {
  await setup();

  expect(
    spies.financialAccountDatasource.adjustAccountBalance,
  ).toHaveBeenCalledWith({
    balance: 120,
    id: "acc-uuid",
  });
});

it("SHOULD invalidate BOTH the accounts and the transactions cache (the adjustment is a transaction)", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
});

it("SHOULD NOT invalidate anything WHEN the datasource fails", async () => {
  spies.financialAccountDatasource.adjustAccountBalance.mockRejectedValueOnce(
    new Error("boom"),
  );

  await expect(setup()).rejects.toThrow("boom");
  expect(spies.cache.invalidate).not.toHaveBeenCalled();
});
