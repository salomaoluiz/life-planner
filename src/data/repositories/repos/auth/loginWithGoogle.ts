import { Datasources } from "@data/datasource";
import LoginWithGoogleEntity from "@domain/entities/auth/LoginWithGoogleEntity";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { isWeb } from "@utils/platform";

async function loginWithGoogle(datasources: Datasources) {
  try {
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
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      error: error,
      repository: "loginRepositoryImpl - loginWithGoogle",
    });
    throw genericError;
  }
}

export default loginWithGoogle;
