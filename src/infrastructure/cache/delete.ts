import { cacheStorage } from "@infrastructure/storage";

import { CacheStringKeys } from "./types";

function invalidate(cacheKey: CacheStringKeys) {
  return cacheStorage.deleteCache(cacheKey);
}

function invalidateAll() {
  return cacheStorage.deleteAllCache();
}

export { invalidate, invalidateAll };
