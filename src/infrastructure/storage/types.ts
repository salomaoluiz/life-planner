enum StorageStringKeys {
  FALLBACK_LANGUAGE = "@fallback_language",
}

const StorageKeys = {
  string: StorageStringKeys,
};

export type StorageDeleteCache = (key: string) => void;

export type StorageDeleteString = (key: StorageStringKeys | string) => void;

export type StorageGetCacheObject<T> = (key: string) => T | undefined;

export type StorageGetString = (
  key: StorageStringKeys | string,
) => null | string;

export type StorageSetCacheObject<T> = (key: string, value: T) => void;

export type StorageSetString = (
  key: StorageStringKeys | string,
  value: string,
) => void;

export default StorageKeys;
