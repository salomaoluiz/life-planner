export enum CacheStringKeys {
  CACHE_USER_DATA = "@cache_user_data",
}

export interface CachedData<T> {
  data: T;
  options: CachedOptions;
}

export interface CachedOptions {
  timestamp: number;
}

export interface CacheParams {
  /* TTL In Seconds
   *  @default 3600
   *  */
  TTL?: number;
}
