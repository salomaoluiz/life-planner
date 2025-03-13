import { CacheStringKeys } from "@infrastructure/storage";

import { setup, spies } from "./mocks/delete.mocks";

it("SHOULD delete item", () => {
  setup.deleteItem("key");

  expect(spies.storage.delete).toHaveBeenCalledTimes(1);
  expect(spies.storage.delete).toHaveBeenCalledWith("key");
});

it("SHOULD invalidate all cache", () => {
  setup.invalidateAllCache();

  expect(spies.cache.clearAll).toHaveBeenCalledTimes(1);
});

it("SHOULD invalidate cache", () => {
  setup.invalidateCache(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.cache.delete).toHaveBeenCalledTimes(1);
  expect(spies.cache.delete).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
});
