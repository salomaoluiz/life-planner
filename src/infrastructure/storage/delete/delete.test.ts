import { CacheStringKeys } from "@infrastructure/cache/types";

import { setup, spies } from "./mocks/delete.mocks";

it("SHOULD delete item", () => {
  setup.deleteItem("key");

  expect(spies.storage.delete).toHaveBeenCalledTimes(1);
  expect(spies.storage.delete).toHaveBeenCalledWith("key");
});

it("SHOULD delete all cache", () => {
  setup.deleteAllCache();

  expect(spies.cache.clearAll).toHaveBeenCalledTimes(1);
});

it("SHOULD delete cache", () => {
  setup.deleteCache(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.cache.delete).toHaveBeenCalledTimes(1);
  expect(spies.cache.delete).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
});
