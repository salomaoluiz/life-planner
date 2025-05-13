import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateFamily.mocks";

it("SHOULD update family AND invalidate cache WHEN called", async () => {
  await setup();

  expect(spies.familyDatasource.updateFamily).toHaveBeenCalledTimes(1);
  expect(spies.familyDatasource.updateFamily).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    name: mocks.defaultParams.name,
  });

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
});
