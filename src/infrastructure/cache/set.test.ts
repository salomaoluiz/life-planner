import { setup, spies } from "./mocks/set.mocks";
import { CacheStringKeys } from "./types";

it("SHOULD set cache object", () => {
  setup(CacheStringKeys.CACHE_USER_DATA, { userId: "1" }, { TTL: 1000 });

  expect(spies.setCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.setCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    {
      data: { userId: "1" },
      options: {
        timestamp: 1000 * 1000,
      },
    },
  );
});

it("SHOULD set cache object with default TTL", () => {
  setup(CacheStringKeys.CACHE_USER_DATA, { userId: "1" });

  expect(spies.setCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.setCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    {
      data: { userId: "1" },
      options: {
        timestamp: 3600 * 1000,
      },
    },
  );
});

it("SHOULD handle error", () => {
  spies.setCacheObject.mockImplementationOnce(() => {
    throw new Error("error");
  });

  setup(CacheStringKeys.CACHE_USER_DATA, { userId: "1" }, { TTL: 1000 });

  expect(spies.setCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledWith(new Error("error"), {
    cacheKey: CacheStringKeys.CACHE_USER_DATA,
    data: { userId: "1" },
    options: { TTL: 1000 },
  });
});
