import { CacheStringKeys } from "@infrastructure/cache";

export type CacheRepository = {
  invalidate(params: InvalidateCacheRepositoryParams): Promise<void>;
};

export interface InvalidateCacheRepositoryParams {
  keys: CacheStringKeys[];
  options?: {
    uniqueId?: string;
  };
}
