export enum CacheStringKeys {
  CACHE_USER_DATA = "@cache_user_data",
}

enum StorageStringKeys {
  FALLBACK_LANGUAGE = "@fallback_language",
}

const StorageKeys = {
  string: StorageStringKeys,
};

export type StorageDeleteString = (key: StorageStringKeys | string) => void;

export type StorageGetCacheObject<T> = (key: CacheStringKeys) => T | undefined;

export type StorageGetString = (
  key: StorageStringKeys | string,
) => null | string;

export type StorageInvalidateCache = (key: CacheStringKeys) => void;

export type StorageInvalidateCacheAll = () => void;

export type StorageSetCacheObject<T> = (key: CacheStringKeys, value: T) => void;

export type StorageSetString = (
  key: StorageStringKeys | string,
  value: string,
) => void;

export default StorageKeys;
