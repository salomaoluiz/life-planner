import { setup, mocks, spies } from "./mocks/loginDatasourceImpl_saveSession";
import { BusinessError, GenericError } from "@domain/entities/errors";

it("SHOULD save session", async () => {
  spies.setSession.mockResolvedValueOnce(mocks.signInSuccess as never);

  const result = await setup();

  expect(spies.setSession).toHaveBeenCalledTimes(1);
  expect(spies.setSession).toHaveBeenCalledWith({
    access_token: "accessToken",
    refresh_token: "refreshToken",
  });
  expect(result).toBeTruthy();
});

it("SHOULD throw an BusinessError if session is missing", async () => {
  spies.setSession.mockResolvedValueOnce(
    mocks.authSessionMissingError as never,
  );

  function func() {
    return setup();
  }

  await expect(func).rejects.toThrow(new BusinessError());
});

it("SHOULD throw an GenericError if setSession fails", async () => {
  spies.setSession.mockResolvedValueOnce(mocks.setSessionError as never);

  function func() {
    return setup();
  }

  await expect(func).rejects.toThrow(new GenericError());
});
