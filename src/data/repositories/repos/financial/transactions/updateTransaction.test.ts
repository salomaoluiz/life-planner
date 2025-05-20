import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateTransaction.mocks";

const updateTransaction =
  spies.financialTransactionDatasource.updateTransaction;

it("SHOULD update transaction AND invalidate cache WHEN called", async () => {
  await setup();

  expect(updateTransaction).toHaveBeenCalledTimes(1);
  expect(updateTransaction).toHaveBeenCalledWith({
    category: mocks.defaultParams.category,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    id: mocks.defaultParams.id,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
});
