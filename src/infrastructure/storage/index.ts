import { deleteItem, invalidateAllCache, invalidateCache } from "./delete";
import { getCacheObject, getString } from "./gets";
import { setCacheObject, setString } from "./sets";

const asyncStorage = {
  deleteItem,
  getString,
  setString,
};

const cacheStorage = {
  getCacheObject,
  invalidateAllCache,
  invalidateCache,
  setCacheObject,
};

export { asyncStorage, cacheStorage };

export { CacheStringKeys, default as StorageKeys } from "./types";
