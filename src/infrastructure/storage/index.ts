import { deleteAllCache, deleteCache, deleteItem } from "./delete";
import { getAllCacheKeys, getCacheObject, getString } from "./gets";
import { setCacheObject, setString } from "./sets";

const asyncStorage = {
  deleteItem,
  getString,
  setString,
};

const cacheStorage = {
  deleteAllCache,
  deleteCache,
  getAllCacheKeys,
  getCacheObject,
  setCacheObject,
};

export { asyncStorage, cacheStorage };

export { default as StorageKeys } from "./types";
