import { CacheStringKeys } from "@infrastructure/cache";

import { setup, spies } from "./mocks/cacheRepositoryImpl.mocks";

it("SHOULD call invalidate correctly", async () => {
  const cacheRepository = setup();

  const params = {
    keys: [CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA],
    options: {
      uniqueId: "81954a71-7999-4262-a7bb-b265b999c5a6",
    },
  };

  const result = await cacheRepository.invalidate(params);

  expect(result).toEqual("invalidate response");
  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.invalidate).toHaveBeenCalledWith(params);
});
