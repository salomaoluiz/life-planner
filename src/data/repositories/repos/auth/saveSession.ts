import { Datasources } from "@data/datasource";
import LoginWithGoogleEntity from "@domain/entities/auth/LoginWithGoogleEntity";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { LoginRepository } from "@domain/repositories/auth";

export type Params = Parameters<LoginRepository["saveSession"]>[0];

async function saveSession(params: Params, datasources: Datasources) {
  try {
    const response = await datasources.loginDatasource.saveSession(params);
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
      repository: "loginRepositoryImpl - saveSession",
    });
    throw genericError;
  }
}

export default saveSession;
