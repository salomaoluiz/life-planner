import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/saveConfigs.mocks";

it("SHOULD call cache.set with the correct parameters", async () => {
  await setup();

  expect(spies.setCache).toHaveBeenCalledTimes(1);
  expect(spies.setCache).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_CONFIGS_DATA,
    mocks.configsModel,
    {
      TTL: 0,
    },
  );
});
