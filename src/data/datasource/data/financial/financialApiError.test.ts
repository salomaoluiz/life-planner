import {
  ApiBusinessError,
  ConnectivityError,
  FieldInvalid,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { mocks, setupThrowable } from "./mocks/financialApiError.mocks";

it("SHOULD map 400 to FieldInvalid naming the sent fields", () => {
  const error = setupThrowable(new ApiBusinessError("Validation Failed", 400), {
    fields: { name: "x" },
  });

  expect(error).toBeInstanceOf(FieldInvalid);
  expect(error).toHaveProperty("message", "The field name are invalid");
});

it("SHOULD map 400 to FieldInvalid even without fields", () => {
  expect(
    setupThrowable(new ApiBusinessError("Validation Failed", 400)),
  ).toBeInstanceOf(FieldInvalid);
});

it("SHOULD map 403 to FinancialOwnerNotAllowed AND 404 to FinancialNotFound", () => {
  expect(setupThrowable(new ApiBusinessError("Forbidden", 403))).toBeInstanceOf(
    FinancialOwnerNotAllowed,
  );
  expect(
    setupThrowable(new ApiBusinessError("Not Found", 404)),
  ).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD map 409 with the conflict factory of the call", () => {
  const error = setupThrowable(new ApiBusinessError("Conflict", 409), {
    conflict: () => new mocks.TestConflict(),
  });

  expect(error).toBeInstanceOf(mocks.TestConflict);
});

it("SHOULD wrap an unmapped status (409 without a factory, 418) in GenericError", () => {
  expect(setupThrowable(new ApiBusinessError("Conflict", 409))).toBeInstanceOf(
    GenericError,
  );
  expect(setupThrowable(new ApiBusinessError("Teapot", 418))).toBeInstanceOf(
    GenericError,
  );
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
  ["FieldInvalid", new FieldInvalid({ value: "x" })],
])("SHOULD re-throw %s untouched", (_name, error) => {
  expect(setupThrowable(error)).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the call context", () => {
  const error = setupThrowable(new Error("boom"));

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    ...mocks.context,
    error: expect.any(Error),
  });
});
