import { cacheStorage } from "@infrastructure/storage";

import { CacheStringKeys } from "./types";

function invalidate(
  cacheKey: CacheStringKeys | CacheStringKeys[],
  options?: { uniqueId?: string },
) {
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
