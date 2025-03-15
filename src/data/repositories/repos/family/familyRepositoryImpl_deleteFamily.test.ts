import { CacheStringKeys } from "@infrastructure/cache";

import { setup, spies } from "./mocks/familyRepositoryImpl_deleteFamily.mocks";

it("SHOULD delete a family", async () => {
  spies.deleteFamily.mockResolvedValueOnce(undefined);

  await setup();

  expect(spies.deleteFamily).toHaveBeenCalledTimes(1);
  expect(spies.deleteFamily).toHaveBeenCalledWith("1234");
});

it("SHOULD invalidate cache", async () => {
  spies.deleteFamily.mockResolvedValueOnce(undefined);

  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
});
