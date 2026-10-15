import { ConnectivityError, GenericError } from "@domain/entities/errors";

import { setup, setupThrowable, spies } from "./mocks/logout.mocks";

it("SHOULD clear the tokens AND tell the API to revoke the session (best effort)", async () => {
  await setup();

  expect(spies.clearToken).toHaveBeenCalledTimes(1);
  expect(spies.api.post).toHaveBeenCalledWith("/v1/auth/logout", {
    refreshToken: "refresh",
  });
});

it("SHOULD clear the tokens locally WITHOUT calling the API WHEN there is no refresh token", async () => {
  spies.getRefreshToken.mockResolvedValueOnce(null);

  await setup();

  expect(spies.clearToken).toHaveBeenCalledTimes(1);
  expect(spies.api.post).not.toHaveBeenCalled();
});

it("SHOULD resolve AND clear locally WHEN the revoke call fails offline", async () => {
  spies.api.post.mockRejectedValueOnce(new ConnectivityError());

  await expect(setup()).resolves.toBeUndefined();
  expect(spies.clearToken).toHaveBeenCalledTimes(1);
});

it("SHOULD still clear locally WHEN reading the refresh token fails", async () => {
  spies.getRefreshToken.mockRejectedValueOnce(new Error("keystore"));

  await expect(setup()).resolves.toBeUndefined();
  expect(spies.clearToken).toHaveBeenCalledTimes(1);
  expect(spies.api.post).not.toHaveBeenCalled();
});

it("SHOULD wrap an unknown error in GenericError", async () => {
  spies.clearToken.mockRejectedValueOnce(new Error("keystore"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "LoginDatasource - logout",
    error: expect.any(Error),
  });
});
