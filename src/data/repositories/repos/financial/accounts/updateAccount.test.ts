import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateAccount.mocks";

it("SHOULD update an account", async () => {
  await setup();
  expect(spies.financialAccountDatasource.updateAccount).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    name: mocks.defaultParams.name,
  });
});

it("SHOULD invalidate cache after account updated", async () => {
  await setup();
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
});
