import { captureException } from "@infrastructure/monitoring";
import { cacheStorage } from "@infrastructure/storage";

import { invalidate } from "./delete";
import { CachedData, CacheStringKeys } from "./types";

function get<T>(key: CacheStringKeys) {
  try {
    const result = cacheStorage.getCacheObject<CachedData<T>>(key);

    if (!result || Date.now() > result.options.timestamp) {
      invalidate(key);
      return null;
    }

    return result.data;
  } catch (error) {
    captureException(error as Error, {
      key,
    });
    return null;
  }
}

export { get };
