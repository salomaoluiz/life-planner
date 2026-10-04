import { Datasources } from "@data/datasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { LoginWithEmailParams } from "@domain/repositories/auth";
import cache, { CacheStringKeys } from "@infrastructure/cache";

async function loginWithEmail(
  params: LoginWithEmailParams,
  datasources: Datasources,
) {
  try {
    await datasources.loginDatasource.loginWithEmail(params);
    cache.invalidate(CacheStringKeys.CACHE_USER_DATA);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      error,
      repository: "loginRepositoryImpl - loginWithEmail",
    });
    throw genericError;
  }
}

export default loginWithEmail;
