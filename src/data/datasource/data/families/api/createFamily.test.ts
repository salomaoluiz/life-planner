import FamilyModel from "@data/models/family/FamilyModel";
import {
  ApiBusinessError,
  ConnectivityError,
  FamilyNotCreated,
  FieldInvalid,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createFamily.mocks";

it("SHOULD POST only the name (the owner comes from the JWT) AND return a FamilyModel", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiFamily);

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/families", {
    name: mocks.params.name,
  });
  expect(result).toEqual(FamilyModel.fromJSON(mocks.apiFamily));
});

it("SHOULD throw FamilyNotCreated WHEN the API answers without a body", async () => {
  spies.post.mockResolvedValueOnce(undefined);

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotCreated);
});

it("SHOULD throw FieldInvalid WHEN the API answers 400", async () => {
  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );

  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.post.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError WITHOUT the family name in the context", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - createFamily",
    error: expect.any(Error),
    ownerId: mocks.params.ownerId,
  });
});
