import * as Sentry from "@sentry/react-native";

jest.mock("@sentry/react-native");

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
