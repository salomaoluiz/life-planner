import { CacheStringKeys } from "@infrastructure/cache/types";

import { mocks, setup, spies } from "./mocks/get.mocks";

it("SHOULD get the cached data", () => {
  spies.getCacheObject.mockReturnValueOnce(mocks.successCacheObject);

  const result = setup(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.getCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.getCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
  expect(result).toEqual(mocks.successCacheObject.data);
});

it("SHOULD invalidate the cache WHEN the cache is expired", () => {
  spies.getCacheObject.mockReturnValueOnce(mocks.expiredCacheObject);

  const result = setup(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.getCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.getCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    undefined,
  );
  expect(result).toBeNull();
});

it("SHOULD return null AND captureException WHEN an error occurs", () => {
  spies.getCacheObject.mockImplementation(() => {
    throw new Error("Test error");
  });

  const result = setup(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.getCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.getCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
  expect(spies.captureException).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledWith(new Error("Test error"), {
    cacheKey: CacheStringKeys.CACHE_USER_DATA,
    options: undefined,
  });
  expect(result).toBeNull();
});

it("SHOULD return null WHEN the cache is empty", () => {
  spies.getCacheObject.mockReturnValueOnce(null);

  const result = setup(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.getCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.getCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
  expect(result).toBeNull();
});
