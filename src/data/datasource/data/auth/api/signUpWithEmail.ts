import { LoginDatasource } from "@data/repositories/repos/auth/loginDatasource";
import {
  ApiBusinessError,
  BusinessError,
  EmailAlreadyInUseError,
  GenericError,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

type Params = Parameters<LoginDatasource["signUpWithEmail"]>[0];

async function signUpWithEmail(params: Params): Promise<void> {
  try {
    await api.post("/v1/auth/signup/email", {
      email: params.email,
      name: params.name,
      password: params.password,
    });
  } catch (error) {
    if (error instanceof ApiBusinessError && error.statusCode === 422) {
      throw new EmailAlreadyInUseError();
    }
    if (error instanceof BusinessError) {
      throw error;
    }

    const genericError = new GenericError();
    // Context deliberately excludes the params: they contain the password.
    genericError.addContext({
      datasource: "LoginDatasource - signUpWithEmail",
      error,
    });
    throw genericError;
  }
}

export default signUpWithEmail;
