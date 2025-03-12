enum StorageStringKeys {
  FALLBACK_LANGUAGE = "@fallback_language",
}

const StorageKeys = {
  string: StorageStringKeys,
};

export type StorageGetString = (
  key: StorageStringKeys,
) => Promise<null | string>;

export type StorageSetString = (
  key: StorageStringKeys,
  value: string,
) => Promise<void>;

export default StorageKeys;
