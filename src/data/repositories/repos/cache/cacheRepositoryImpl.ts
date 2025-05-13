import { CacheRepository } from "@domain/repositories/cache";

import invalidate from "./invalidate";

function cacheRepositoryImpl(): CacheRepository {
  return {
    async invalidate(params): Promise<void> {
      return invalidate(params);
    },
  };
}

export default cacheRepositoryImpl;
