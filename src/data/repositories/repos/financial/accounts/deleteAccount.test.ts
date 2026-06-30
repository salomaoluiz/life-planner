import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/deleteAccount.mocks";

it("SHOULD delete an account", async () => {
  await setup();
  expect(spies.financialAccountDatasource.deleteAccount).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    ownerId: mocks.defaultParams.ownerId,
  });
});

it("SHOULD invalidate cache after account deleted", async () => {
  await setup();
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
});
