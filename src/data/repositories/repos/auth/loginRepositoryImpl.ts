import { Datasources } from "@data/datasource";
import { LoginRepository } from "@domain/repositories/auth";
import { isWeb } from "@utils/platform";

function loginRepositoryImpl(datasources: Datasources): LoginRepository {
  return {
    async loginWithGoogle(): Promise<boolean> {
      if (isWeb()) {
        await datasources.loginDatasource.loginWithOAuth();
        return true;
      }

      await datasources.loginDatasource.loginWithIdToken();
      return true;
    },
    async logout(): Promise<void> {
      await datasources.loginDatasource.logout();
    },
    async saveSession(params): Promise<boolean> {
      await datasources.loginDatasource.saveSession(params);
      return true;
    },
  };
}

export default loginRepositoryImpl;
