import { CacheStringKeys } from "@infrastructure/cache/types";

enum StorageStringKeys {
  FALLBACK_LANGUAGE = "@fallback_language",
}

const StorageKeys = {
  string: StorageStringKeys,
};

export type StorageDeleteCache = (key: CacheStringKeys) => void;

export type StorageDeleteString = (key: StorageStringKeys | string) => void;

export type StorageGetCacheObject<T> = (key: CacheStringKeys) => T | undefined;

export type StorageGetString = (
  key: StorageStringKeys | string,
) => null | string;

export type StorageSetCacheObject<T> = (key: CacheStringKeys, value: T) => void;

export type StorageSetString = (
  key: StorageStringKeys | string,
  value: string,
) => void;

export default StorageKeys;
