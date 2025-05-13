import { Datasources } from "@data/datasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import cache from "@infrastructure/cache";

async function logout(datasources: Datasources) {
  try {
    await datasources.loginDatasource.logout();
    cache.invalidateAll();
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      error: error,
      repository: "loginRepositoryImpl - logout",
    });
    throw genericError;
  }
}

export default logout;
