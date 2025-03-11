enum StorageStringKeys {
  FALLBACK_LANGUAGE = "@fallback_language",
}

const StorageKeys = {
  string: StorageStringKeys,
};

export type StorageGetString = (
  key: StorageStringKeys,
) => Promise<string | null>;

export type StorageSetString = (
  key: StorageStringKeys,
  value: string,
) => Promise<void>;

export default StorageKeys;
