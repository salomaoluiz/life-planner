import { LoginDatasource } from "@data/repositories/repos/auth/loginDatasource";
import {
  ApiBusinessError,
  BusinessError,
  GenericError,
  InvalidCredentialsError,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";
import { tokenStorage } from "@infrastructure/token";

type Params = Parameters<LoginDatasource["loginWithEmail"]>[0];

async function loginWithEmail(params: Params): Promise<void> {
  try {
    const response = await api.post<{ token?: string }>(
      "/v1/auth/login/email",
      { email: params.email, password: params.password },
    );

    if (!response?.token) {
      throw new Error("Login response without token");
    }

    await tokenStorage.setToken(response.token);
  } catch (error) {
    if (error instanceof ApiBusinessError && error.statusCode === 401) {
      throw new InvalidCredentialsError();
    }
    if (error instanceof BusinessError) {
      throw error;
    }

    const genericError = new GenericError();
    // Context deliberately excludes the params: they contain the password.
    genericError.addContext({
      datasource: "LoginDatasource - loginWithEmail",
      error,
    });
    throw genericError;
  }
}

export default loginWithEmail;
