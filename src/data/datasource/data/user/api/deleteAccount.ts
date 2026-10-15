import { UserDatasource } from "@data/repositories/repos/user/userDatasource";
import {
  AccountEmailMismatchError,
  ApiBusinessError,
  BusinessError,
  GenericError,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

export type Response = ReturnType<UserDatasource["deleteAccount"]>;

async function deleteAccount(email: string): Response {
  try {
    await api.delete<void>("/v1/user/me", { email });
  } catch (error) {
    if (error instanceof ApiBusinessError && error.statusCode === 422) {
      throw new AccountEmailMismatchError();
    }
    if (error instanceof BusinessError) {
      throw error;
    }

    const genericError = new GenericError();
    // Context deliberately excludes the email.
    genericError.addContext({
      datasource: "UserDatasource - deleteAccount",
      error,
    });
    throw genericError;
  }
}

export default deleteAccount;
