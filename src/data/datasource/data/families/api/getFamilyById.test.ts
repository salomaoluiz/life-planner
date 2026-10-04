import FamilyModel from "@data/models/family/FamilyModel";
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
} from "./mocks/getFamilyById.mocks";

it("SHOULD return a FamilyModel from GET /v1/families/:id", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiFamily);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(`/v1/families/${mocks.familyId}`);
  expect(result).toEqual(FamilyModel.fromJSON(mocks.apiFamily));
});

it("SHOULD throw FamilyNotFound WHEN the API answers 404 (not found OR not a member)", async () => {
  spies.get.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotFound);
});

it("SHOULD throw FieldInvalid WHEN the API answers 400", async () => {
  spies.get.mockRejectedValueOnce(new ApiBusinessError("Bad Request", 400));

  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);
});

it("SHOULD re-throw other business errors", async () => {
  const error = new ConnectivityError();
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - getFamilyById",
    error: expect.any(Error),
    familyId: mocks.familyId,
  });
});
