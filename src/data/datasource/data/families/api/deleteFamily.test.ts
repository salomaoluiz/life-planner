import {
  ApiBusinessError,
  ConnectivityError,
  FamilyHasRecords,
  FamilyNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteFamily.mocks";

it("SHOULD DELETE /v1/families/:id (204, empty body)", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.delete).toHaveBeenCalledWith(`/v1/families/${mocks.id}`);
});

it("SHOULD throw FamilyHasRecords WHEN the API answers 409", async () => {
  spies.delete.mockRejectedValueOnce(
    new ApiBusinessError("Family still owns records", 409),
  );

  expect(await setupThrowable()).toBeInstanceOf(FamilyHasRecords);
});

it("SHOULD throw FamilyNotFound WHEN the API answers 404", async () => {
  spies.delete.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotFound);
});

it("SHOULD wrap a 403 (member but not owner) in GenericError", async () => {
  spies.delete.mockRejectedValueOnce(new ApiBusinessError("Forbidden", 403));

  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});

it("SHOULD re-throw other business errors", async () => {
  const error = new ConnectivityError();
  spies.delete.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError", async () => {
  spies.delete.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - deleteFamily",
    error: expect.any(Error),
    id: mocks.id,
  });
});
