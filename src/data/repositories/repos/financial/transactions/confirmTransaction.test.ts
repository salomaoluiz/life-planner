import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/confirmTransaction.mocks";

it("SHOULD confirm through the datasource AND invalidate transactions, accounts, cards and tags", async () => {
  await setup();

  expect(
    spies.financialTransactionDatasource.confirmTransaction,
  ).toHaveBeenCalledWith(mocks.defaultParams);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
});
