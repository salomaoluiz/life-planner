import * as Sentry from "@sentry/react-native";

jest.mock("@sentry/react-native");

import { BusinessError, GenericError } from "@domain/entities/errors/common";

import { sentryCaptureException, sentryCaptureMessage } from "./capture";

const captureExceptionSpy = jest.spyOn(Sentry, "captureException");
const captureMessageSpy = jest.spyOn(Sentry, "captureMessage");

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD call Sentry.captureException", () => {
  const exception = new Error("error");
  const extra = { extra: "extra" };

  sentryCaptureException(exception, extra);

  expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(captureExceptionSpy).toHaveBeenCalledWith(exception, { extra });
});

it("SHOULD call Sentry.captureMessage", () => {
  const message = "message";
  const extra = { extra: "extra" };

  sentryCaptureMessage(message, extra);

  expect(captureMessageSpy).toHaveBeenCalledTimes(1);
  expect(captureMessageSpy).toHaveBeenCalledWith(message, { extra });
});

it("SHOULD NOT capture a BusinessError", () => {
  sentryCaptureException(new BusinessError());

  expect(captureExceptionSpy).not.toHaveBeenCalled();
});

it("SHOULD capture a GenericError with its context and code", () => {
  const error = new GenericError();
  error.addContext({ method: "GET" });

  sentryCaptureException(error);

  expect(captureExceptionSpy).toHaveBeenCalledWith(
    error,
    expect.objectContaining({
      contexts: { error_context: { method: "GET" } },
      tags: { error_code: "TechnicalError" },
    }),
  );
});
