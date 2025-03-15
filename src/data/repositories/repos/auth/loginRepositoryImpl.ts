import { Datasources } from "@data/datasource";
import { LoginRepository } from "@domain/repositories/auth";
import cache from "@infrastructure/cache";
import { isWeb } from "@utils/platform";

function loginRepositoryImpl(datasources: Datasources): LoginRepository {
  return {
    async loginWithGoogle(): Promise<void> {
      if (isWeb()) {
        await datasources.loginDatasource.loginWithOAuth();
        return;
      }

      await datasources.loginDatasource.loginWithIdToken();
    },
    async logout(): Promise<void> {
      await datasources.loginDatasource.logout();
      cache.invalidateAll();
    },
    async saveSession(params): Promise<boolean> {
      await datasources.loginDatasource.saveSession(params);
      return true;
    },
  };
}

export default loginRepositoryImpl;
