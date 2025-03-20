import { Datasources } from "@data/datasource";
import LoginWithGoogleEntity from "@domain/entities/auth/LoginWithGoogleEntity";
import { LoginRepository } from "@domain/repositories/auth";
import cache from "@infrastructure/cache";
import { isWeb } from "@utils/platform";

function loginRepositoryImpl(datasources: Datasources): LoginRepository {
  return {
    async loginWithGoogle() {
      if (isWeb()) {
        await datasources.loginDatasource.loginWithOAuth();
        return;
      }

      const response = await datasources.loginDatasource.loginWithIdToken();

      return new LoginWithGoogleEntity({
        avatarURL: response.avatarURL,
        email: response.email,
        id: response.id,
        name: response.name,
      });
    },
    async logout(): Promise<void> {
      await datasources.loginDatasource.logout();
      cache.invalidateAll();
    },
    async saveSession(params) {
      const response = await datasources.loginDatasource.saveSession(params);
      return new LoginWithGoogleEntity({
        avatarURL: response.avatarURL,
        email: response.email,
        id: response.id,
        name: response.name,
      });
    },
  };
}

export default loginRepositoryImpl;
