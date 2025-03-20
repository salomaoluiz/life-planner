import { cache, storage } from "@infrastructure/storage/init";

import { StorageGetCacheObject, StorageGetString } from "../types";

function getAllCacheKeys() {
  return cache.getAllKeys();
}

function getCacheObject<T>(
  ...props: Parameters<StorageGetCacheObject<T>>
): ReturnType<StorageGetCacheObject<T>> {
  const string = cache.getString(props[0]);
  if (!string) return undefined;

  return JSON.parse(string) as T;
}

function getString(
  ...props: Parameters<StorageGetString>
): ReturnType<StorageGetString> {
  return storage.getString(props[0]) ?? null;
}

export { getAllCacheKeys, getCacheObject, getString };
