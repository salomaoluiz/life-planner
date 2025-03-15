import { cacheStorage } from "@infrastructure/storage";

import { CacheStringKeys } from "./types";

function invalidate(cacheKey: CacheStringKeys | CacheStringKeys[]) {
  if (Array.isArray(cacheKey)) {
    return cacheKey.map((key) => cacheStorage.deleteCache(key));
  }
  return cacheStorage.deleteCache(cacheKey);
}

function invalidateAll() {
  return cacheStorage.deleteAllCache();
}

export { invalidate, invalidateAll };
