import UserModel from "@data/models/user/UserModel";
import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
} from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getUserById.mocks";

it("SHOULD return a UserModel from GET /v1/user/:id", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiUser);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(`/v1/user/${mocks.id}`);
  expect(result).toEqual(UserModel.fromJSON(mocks.apiUser));
});

it("SHOULD return undefined WHEN the API answers 404", async () => {
  spies.get.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setup()).toBeUndefined();
});

it("SHOULD rethrow other business errors", async () => {
  spies.get.mockRejectedValueOnce(new ConnectivityError());

  expect(await setupThrowable()).toBeInstanceOf(ConnectivityError);
});

it("SHOULD wrap unknown errors in GenericError", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "UserDatasource - getUserById",
    error: expect.any(Error),
    id: mocks.id,
  });
});
