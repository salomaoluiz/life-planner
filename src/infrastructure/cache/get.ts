import { captureException } from "@infrastructure/monitoring";
import { cacheStorage } from "@infrastructure/storage";

import { invalidate } from "./delete";
import { CachedData, CacheStringKeys } from "./types";

function get<T>(cacheKey: CacheStringKeys, options?: { uniqueId?: string }) {
  try {
    const key = `${cacheKey}${options?.uniqueId ?? ""}`;
    const result = cacheStorage.getCacheObject<CachedData<T>>(key);

    if (!result || Date.now() > result.options.timestamp) {
      invalidate(cacheKey, options);
      return null;
    }

    return result.data;
  } catch (error) {
    captureException(error as Error, {
      cacheKey,
      options,
    });
    return null;
  }
}

export { get };
