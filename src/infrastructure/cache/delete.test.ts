import { CacheStringKeys } from "@infrastructure/cache/types";
import { cacheStorage } from "@infrastructure/storage";

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

describe("WHEN no uniqueId is given", () => {
  beforeEach(() => {
    jest
      .spyOn(cacheStorage, "getAllCacheKeys")
      .mockReturnValue([
        `${CacheStringKeys.CACHE_USER_DATA}1`,
        `${CacheStringKeys.CACHE_USER_DATA}2`,
        `${CacheStringKeys.CACHE_FAMILIES_DATA}1`,
        "unrelated",
      ]);
  });

  it("SHOULD delete every cached key that contains the key", () => {
    setup.invalidate(CacheStringKeys.CACHE_USER_DATA);

    expect(spies.deleteCache).toHaveBeenCalledTimes(2);
    expect(spies.deleteCache).toHaveBeenCalledWith(
      `${CacheStringKeys.CACHE_USER_DATA}1`,
    );
    expect(spies.deleteCache).toHaveBeenCalledWith(
      `${CacheStringKeys.CACHE_USER_DATA}2`,
    );
  });

  it("SHOULD delete every cached key that contains any of the keys", () => {
    setup.invalidate([
      CacheStringKeys.CACHE_USER_DATA,
      CacheStringKeys.CACHE_FAMILIES_DATA,
    ]);

    expect(spies.deleteCache).toHaveBeenCalledTimes(3);
    expect(spies.deleteCache).not.toHaveBeenCalledWith("unrelated");
  });

  it("SHOULD NOT delete anything WHEN no cached key matches", () => {
    setup.invalidate(CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA);

    expect(spies.deleteCache).not.toHaveBeenCalled();
  });
});
