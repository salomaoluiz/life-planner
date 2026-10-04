import {
  ConnectivityError,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
} from "@domain/entities/errors";

type AuthErrorKey =
  | "auth.errors.generic"
  | "auth.errors.network"
  | "login.errors.invalidCredentials"
  | "signup.errors.emailInUse";

function mapAuthError(error: unknown): AuthErrorKey {
  if (error instanceof InvalidCredentialsError) {
    return "login.errors.invalidCredentials";
  }
  if (error instanceof EmailAlreadyInUseError) {
    return "signup.errors.emailInUse";
  }
  if (error instanceof ConnectivityError) {
    return "auth.errors.network";
  }
  return "auth.errors.generic";
}

export { AuthErrorKey };
export default mapAuthError;
