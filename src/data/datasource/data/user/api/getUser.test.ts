import UserModel from "@data/models/user/UserModel";
import {
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getUser.mocks";

it("SHOULD return a UserModel from GET /v1/user/me WHEN a token is stored", async () => {
  spies.getToken.mockResolvedValueOnce("jwt");
  spies.get.mockResolvedValueOnce(mocks.apiUser);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith("/v1/user/me");
  expect(result).toEqual(UserModel.fromJSON(mocks.apiUser));
});

it("SHOULD map a missing photoUrl to no avatar", async () => {
  spies.getToken.mockResolvedValueOnce("jwt");
  spies.get.mockResolvedValueOnce({ ...mocks.apiUser, photoUrl: undefined });

  expect((await setup()).avatarURL).toBeUndefined();
});

it("SHOULD throw UserNotLoggedError WITHOUT calling the API WHEN no token is stored (cold start)", async () => {
  spies.getToken.mockResolvedValueOnce(null);

  expect(await setupThrowable()).toBeInstanceOf(UserNotLoggedError);
  expect(spies.get).not.toHaveBeenCalled();
});

it("SHOULD rethrow UserNotLoggedError from the API client (401)", async () => {
  spies.getToken.mockResolvedValueOnce("jwt");
  spies.get.mockRejectedValueOnce(new UserNotLoggedError());

  expect(await setupThrowable()).toBeInstanceOf(UserNotLoggedError);
});

it("SHOULD rethrow business errors such as ConnectivityError", async () => {
  spies.getToken.mockResolvedValueOnce("jwt");
  spies.get.mockRejectedValueOnce(new ConnectivityError());

  expect(await setupThrowable()).toBeInstanceOf(ConnectivityError);
});

it("SHOULD wrap unknown errors in GenericError with datasource context", async () => {
  spies.getToken.mockResolvedValueOnce("jwt");
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "UserDatasource - getUser",
    error: expect.any(Error),
  });
});
