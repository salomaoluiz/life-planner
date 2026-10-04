import {
  ApiBusinessError,
  ConnectivityError,
  FamilyNotFound,
  FieldInvalid,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateFamily.mocks";

it("SHOULD PATCH /v1/families/:id with only the name", async () => {
  spies.patch.mockResolvedValueOnce({});

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.patch).toHaveBeenCalledWith(`/v1/families/${mocks.params.id}`, {
    name: mocks.params.name,
  });
});

it("SHOULD throw FamilyNotFound WHEN the API answers 404", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotFound);
});

it("SHOULD throw FieldInvalid WHEN the API answers 400", async () => {
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );

  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);
});

it("SHOULD wrap a 403 (member but not owner) in GenericError, like any unexpected answer", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Forbidden", 403));

  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});

it("SHOULD re-throw other business errors", async () => {
  const error = new ConnectivityError();
  spies.patch.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the id only", async () => {
  spies.patch.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - updateFamily",
    error: expect.any(Error),
    id: mocks.params.id,
  });
});
