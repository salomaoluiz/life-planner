import {
  ApiBusinessError,
  ConnectivityError,
  EmailAlreadyInUseError,
  GenericError,
  InvalidCredentialsError,
} from "@domain/entities/errors";

import mapAuthError from "./mapAuthError";

it.each([
  [new InvalidCredentialsError(), "login.errors.invalidCredentials"],
  [new EmailAlreadyInUseError(), "signup.errors.emailInUse"],
  [new ConnectivityError(), "auth.errors.network"],
  [new ApiBusinessError("Validation Failed", 400), "auth.errors.generic"],
  [new GenericError(), "auth.errors.generic"],
  [new Error("x"), "auth.errors.generic"],
])("SHOULD map %p to %s", (error, key) => {
  expect(mapAuthError(error)).toBe(key);
});
