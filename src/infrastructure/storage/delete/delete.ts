import { cache, storage } from "@infrastructure/storage/init";
import {
  StorageDeleteString,
  StorageInvalidateCache,
} from "@infrastructure/storage/types";

export function deleteItem(...params: Parameters<StorageDeleteString>) {
  return storage.delete(params[0]);
}

export function invalidateAllCache() {
  return cache.clearAll();
}

export function invalidateCache(...params: Parameters<StorageInvalidateCache>) {
  return cache.delete(params[0]);
}
