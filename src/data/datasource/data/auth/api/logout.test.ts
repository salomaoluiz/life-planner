import { GenericError } from "@domain/entities/errors";

import { setup, setupThrowable, spies } from "./mocks/logout.mocks";

it("SHOULD clear the stored token without calling the API", async () => {
  await setup();

  expect(spies.clearToken).toHaveBeenCalledTimes(1);
  expect(spies.api.get).not.toHaveBeenCalled();
  expect(spies.api.post).not.toHaveBeenCalled();
  expect(spies.api.delete).not.toHaveBeenCalled();
});

it("SHOULD resolve WHEN no token was stored", async () => {
  spies.clearToken.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();
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
