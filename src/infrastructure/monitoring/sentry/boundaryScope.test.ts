import { GenericError } from "@domain/entities/errors/common";

import sentryPrepareBoundaryScope from "./boundaryScope";

const scope = {
  setContext: jest.fn(),
  setFingerprint: jest.fn(),
  setTag: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

it("SHOULD set the context, the tag and the fingerprint of a GenericError", () => {
  const error = new GenericError();
  error.addContext({ fingerprint: ["api", "GET", "/r", 500], method: "GET" });

  sentryPrepareBoundaryScope(scope as never, error);

  expect(scope.setContext).toHaveBeenCalledWith(
    "error_context",
    expect.any(Object),
  );
  expect(scope.setTag).toHaveBeenCalledWith("error_code", "TechnicalError");
  expect(scope.setFingerprint).toHaveBeenCalledWith([
    "api",
    "GET",
    "/r",
    "500",
  ]);
});

it("SHOULD leave the scope alone for a plain Error", () => {
  sentryPrepareBoundaryScope(scope as never, new Error("x"));

  expect(scope.setContext).not.toHaveBeenCalled();
  expect(scope.setFingerprint).not.toHaveBeenCalled();
});
