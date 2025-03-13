import { cache, storage } from "@infrastructure/storage/init";

import { StorageSetCacheObject, StorageSetString } from "../types";

function setCacheObject<T>(
  ...props: Parameters<StorageSetCacheObject<T>>
): ReturnType<StorageSetCacheObject<T>> {
  cache.set(props[0], JSON.stringify(props[1]));
}

function setString(
  ...props: Parameters<StorageSetString>
): ReturnType<StorageSetString> {
  storage.set(props[0], props[1]);
}

export { setCacheObject, setString };
