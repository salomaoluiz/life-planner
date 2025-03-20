import { cacheStorage } from "@infrastructure/storage";

import { CacheStringKeys } from "./types";

function invalidate(
  cacheKey: CacheStringKeys | CacheStringKeys[],
  options?: { uniqueId?: string },
) {
  if (!options?.uniqueId) {
    const allKeys = cacheStorage.getAllCacheKeys();

    const keysToInvalidate = allKeys.filter((cachedKey) => {
      if (Array.isArray(cacheKey)) {
        return cacheKey.some((key) => cachedKey.includes(key));
      }
      return cachedKey.includes(cacheKey);
    });

    return keysToInvalidate.forEach((key) => cacheStorage.deleteCache(key));
  }

  if (Array.isArray(cacheKey)) {
    return cacheKey.map((key) =>
      cacheStorage.deleteCache(`${key}${options?.uniqueId ?? ""}`),
    );
  }
  return cacheStorage.deleteCache(`${cacheKey}${options?.uniqueId ?? ""}`);
}

function invalidateAll() {
  return cacheStorage.deleteAllCache();
}

export { invalidate, invalidateAll };
