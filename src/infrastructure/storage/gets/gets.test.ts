import { CacheStringKeys } from "@infrastructure/cache/types";

import StorageKeys from "../types";
import { mocks, setup, spies } from "./mocks/gets.mocks";

it("SHOULD get string", () => {
  spies.getItem.mockReturnValue(mocks.getItemResponse as never);

  const result = setup.getString(StorageKeys.string.FALLBACK_LANGUAGE);

  expect(spies.getItem).toHaveBeenCalledTimes(1);
  expect(spies.getItem).toHaveBeenCalledWith(
    StorageKeys.string.FALLBACK_LANGUAGE,
  );
  expect(result).toEqual(mocks.getItemResponse);
});

it("SHOULD get cache object", () => {
  spies.getItem.mockReturnValue(JSON.stringify(mocks.cacheObjectMock) as never);

  const result = setup.getCacheObject(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.getItem).toHaveBeenCalledTimes(1);
  expect(spies.getItem).toHaveBeenCalledWith(CacheStringKeys.CACHE_USER_DATA);
  expect(result).toEqual(mocks.cacheObjectMock);
});

it("SHOULD get undefined WHEN cache object is not found", () => {
  spies.getItem.mockReturnValue(undefined as never);

  const result = setup.getCacheObject(CacheStringKeys.CACHE_USER_DATA);

  expect(spies.getItem).toHaveBeenCalledTimes(1);
  expect(spies.getItem).toHaveBeenCalledWith(CacheStringKeys.CACHE_USER_DATA);
  expect(result).toBeUndefined();
});
