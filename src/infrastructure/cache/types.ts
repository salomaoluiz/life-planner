export enum CacheStringKeys {
  CACHE_FAMILIES_DATA = "@cache_families_data",
  CACHE_FAMILY_MEMBERS_DATA = "@cache_family_members_data",
  CACHE_STOCK_DATA = "@cache_stock_data",
  CACHE_USER_BY_ID_DATA = "@cache_user_by_id_data",
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

  /* ID used when have multiple cache entries with the same key */
  uniqueId?: string;
}
