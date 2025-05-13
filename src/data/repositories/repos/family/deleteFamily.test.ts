import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/deleteFamily.mocks";

it("SHOULD delete family AND invalidate cache WHEN called", async () => {
  await setup();

  expect(spies.familyDatasource.deleteFamily).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
});
