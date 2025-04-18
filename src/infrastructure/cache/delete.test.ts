import { CacheStringKeys } from "@infrastructure/cache/types";

import { setup, spies } from "./mocks/delete.mocks";

it("SHOULD delete cache by Cache Key", async () => {
  setup.invalidate(CacheStringKeys.CACHE_USER_DATA, { uniqueId: "1234" });

  expect(spies.deleteCache).toHaveBeenCalledTimes(1);
  expect(spies.deleteCache).toHaveBeenCalledWith(
    `${CacheStringKeys.CACHE_USER_DATA}1234`,
  );
});

it("SHOULD delete multiple cache by Cache Key", async () => {
  setup.invalidate(
    [
      CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
      CacheStringKeys.CACHE_FAMILIES_DATA,
    ],
    { uniqueId: "1234" },
  );

  expect(spies.deleteCache).toHaveBeenCalledTimes(2);
  expect(spies.deleteCache).toHaveBeenCalledWith(
    `${CacheStringKeys.CACHE_FAMILIES_DATA}1234`,
  );
  expect(spies.deleteCache).toHaveBeenCalledWith(
    `${CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA}1234`,
  );
});

it("SHOULD delete all cache", async () => {
  setup.invalidateAll();

  expect(spies.deleteAllCache).toHaveBeenCalledTimes(1);
  expect(spies.deleteAllCache).toHaveBeenCalledWith();
});
