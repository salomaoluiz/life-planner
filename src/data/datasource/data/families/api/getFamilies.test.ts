import FamilyModel from "@data/models/family/FamilyModel";
import {
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getFamilies.mocks";

it("SHOULD return FamilyModels from GET /v1/families (the user comes from the JWT)", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiFamilies);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith("/v1/families");
  expect(result).toEqual([FamilyModel.fromJSON(mocks.apiFamilies[0])]);
});

it("SHOULD return an empty list WHEN the API returns []", async () => {
  spies.get.mockResolvedValueOnce([]);

  expect(await setup()).toEqual([]);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the user id", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - getFamilies",
    error: expect.any(Error),
    userId: mocks.userId,
  });
});
