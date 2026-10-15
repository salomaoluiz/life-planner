import { GenericError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

// Local cleanup always happens; telling the API to revoke the session is best effort
// (offline, 5xx, any status) and never delays or fails the logout.
async function logout(): Promise<void> {
  try {
    const refreshToken = await tokenStorage.getRefreshToken().catch(() => null);
    await tokenStorage.clearToken();
    if (refreshToken) {
      void api.post("/v1/auth/logout", { refreshToken }).catch(() => undefined);
    }
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({ datasource: "LoginDatasource - logout", error });
    throw genericError;
  }
}

export default logout;
