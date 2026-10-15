import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateTransaction.mocks";

const updateTransaction =
  spies.financialTransactionDatasource.updateTransaction;

it("SHOULD update transaction AND invalidate cache WHEN called", async () => {
  await setup();

  expect(updateTransaction).toHaveBeenCalledTimes(1);
  expect(updateTransaction).toHaveBeenCalledWith({
    accountId: mocks.defaultParams.accountId,
    category: mocks.defaultParams.category,
    categoryId: mocks.defaultParams.categoryId,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    id: mocks.defaultParams.id,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(2);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
});

it("SHOULD also invalidate the accounts cache (their balances changed)", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
});
