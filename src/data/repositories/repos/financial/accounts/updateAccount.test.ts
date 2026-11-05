import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateAccount.mocks";
import updateAccount from "./updateAccount";

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

it("SHOULD forward isFavorite to the datasource (spec 094)", async () => {
  await updateAccount({ id: "acc-uuid", isFavorite: true }, datasourcesMocks);

  expect(spies.financialAccountDatasource.updateAccount).toHaveBeenCalledWith(
    expect.objectContaining({ id: "acc-uuid", isFavorite: true }),
  );
});
