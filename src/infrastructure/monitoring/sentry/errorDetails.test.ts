import {
  ApiBusinessError,
  ConnectivityError,
} from "@domain/entities/errors/api";
import { UserNotLoggedError } from "@domain/entities/errors/auth";
import { GenericError } from "@domain/entities/errors/common";

import { buildCaptureOptions, isExpectedError } from "./errorDetails";

describe("isExpectedError", () => {
  it.each([
    new ApiBusinessError("x", 422),
    new ConnectivityError(),
    new UserNotLoggedError(),
  ])("SHOULD treat %p as expected", (error) => {
    expect(isExpectedError(error)).toBe(true);
  });

  it("SHOULD NOT treat a GenericError or a plain Error as expected", () => {
    expect(isExpectedError(new GenericError())).toBe(false);
    expect(isExpectedError(new Error("boom"))).toBe(false);
    expect(isExpectedError("string")).toBe(false);
  });
});

describe("buildCaptureOptions", () => {
  it("SHOULD only forward extra for a plain Error", () => {
    expect(buildCaptureOptions(new Error("x"), { a: 1 })).toEqual({
      extra: { a: 1 },
    });
  });

  it("SHOULD add error_context, error_code and the fingerprint of a GenericError", () => {
    const error = new GenericError();
    error.addContext({
      description: "private",
      fingerprint: ["api", "GET", "/v1/a/:id", 500],
      method: "GET",
    });

    const options = buildCaptureOptions(error);

    expect(options.tags).toEqual({ error_code: "TechnicalError" });
    expect(options.fingerprint).toEqual(["api", "GET", "/v1/a/:id", "500"]);
    expect(options.contexts?.error_context).toMatchObject({ method: "GET" });
    expect(options.contexts?.error_context).not.toHaveProperty("description");
  });

  it("SHOULD title the default message with the use case or the scrubbed cache key", () => {
    const withKey = new GenericError();
    withKey.addContext({ cacheString: "transactions?q=milk&from=1" });
    const withUseCase = new GenericError();
    withUseCase.addContext({ cacheString: "k", useCase: "createAccount" });
    const withMessage = new GenericError();
    withMessage.message = "HTTP 500 GET /v1/a";
    withMessage.addContext({ cacheString: "k" });

    buildCaptureOptions(withKey);
    buildCaptureOptions(withUseCase);
    buildCaptureOptions(withMessage);

    expect(withKey.message).toBe(
      "Occurred an error (transactions?q=[redacted]&from=1)",
    );
    expect(withUseCase.message).toBe("Occurred an error (createAccount)");
    expect(withMessage.message).toBe("HTTP 500 GET /v1/a");
  });
});
