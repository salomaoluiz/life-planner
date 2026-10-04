import { GenericError } from "@domain/entities/errors";
import { tokenStorage } from "@infrastructure/token";

// Local only: there is no server-side revocation, so logout never touches the network.
async function logout(): Promise<void> {
  try {
    await tokenStorage.clearToken();
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({ datasource: "LoginDatasource - logout", error });
    throw genericError;
  }
}

export default logout;
