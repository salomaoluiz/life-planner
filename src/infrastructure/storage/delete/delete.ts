import { cache, storage } from "@infrastructure/storage/init";
import {
  StorageDeleteCache,
  StorageDeleteString,
} from "@infrastructure/storage/types";

export function deleteAllCache() {
  return cache.clearAll();
}

export function deleteCache(...params: Parameters<StorageDeleteCache>) {
  return cache.delete(params[0]);
}

export function deleteItem(...params: Parameters<StorageDeleteString>) {
  return storage.delete(params[0]);
}
