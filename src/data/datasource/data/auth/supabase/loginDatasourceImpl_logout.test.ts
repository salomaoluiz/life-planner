import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/loginDatasourceImpl_logout.mocks";

it("SHOULD logout", async () => {
  spies.signOut.mockResolvedValueOnce(mocks.success);

  await setup();

  expect(spies.signOut).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an GenericError if signOut fails", async () => {
  spies.signOut.mockResolvedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(GenericError);
  expect(result).toHaveProperty("context", {
    datasource: "LoginDatasource - logout",
    result: mocks.errors.unknown,
  });
});

it("SHOULD return undefined if the error is AuthSessionMissingError", async () => {
  spies.signOut.mockResolvedValueOnce(mocks.errors.authSessionMissing);

  const result = await setup();

  expect(spies.signOut).toHaveBeenCalledTimes(1);
  expect(result).toBeUndefined();
});
