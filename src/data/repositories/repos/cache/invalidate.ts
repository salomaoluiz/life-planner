import { BusinessError, GenericError } from "@domain/entities/errors";
import { CacheRepository } from "@domain/repositories/cache";
import cache from "@infrastructure/cache";

export type Params = Parameters<CacheRepository["invalidate"]>[0];

async function invalidate(params: Params) {
  try {
    cache.invalidate(params.keys, { uniqueId: params?.options?.uniqueId });
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      error: error,
      params,
      repository: "cacheRepositoryImpl - invalidate",
    });

    throw genericError;
  }
}

export default invalidate;
