import { add, Duration } from "@infrastructure/date";
import { captureException } from "@infrastructure/monitoring";
import { cacheStorage } from "@infrastructure/storage";

import { CachedData, CacheParams, CacheStringKeys } from "./types";

const DEFAULT_TTL = 3600;
function set<T>(key: CacheStringKeys, data: T, options?: CacheParams) {
  try {
    const ttlInMs = (options?.TTL ?? DEFAULT_TTL) * 1000;

    const timestamp = add(Date.now(), ttlInMs, Duration.milliseconds).getTime();

    const cachedData: CachedData<T> = {
      data,
      options: {
        timestamp,
      },
    };

    cacheStorage.setCacheObject(key, cachedData);
  } catch (error) {
    captureException(error as Error, {
      data,
      key,
      options,
    });
  }
}

export { set };
