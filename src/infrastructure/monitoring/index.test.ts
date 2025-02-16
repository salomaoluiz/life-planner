jest.mock("./sentry");

import * as Sentry from "./sentry";
import {
  captureException,
  initializeMonitoring,
  MonitoringWrapper,
  addBreadcrumb,
  captureMessage,
  navigationIntegration,
} from "./";

it("SHOULD call sentryInitialize", () => {
  initializeMonitoring();

  expect(Sentry.sentryInitialize).toHaveBeenCalledTimes(1);
});

it("SHOULD call sentryAddBreadcrumb", () => {
  const breadcrumb = {
    message: "breadcrumb",
    category: "category",
    level: "error" as const,
  };

  addBreadcrumb(breadcrumb);

  expect(Sentry.sentryAddBreadcrumb).toHaveBeenCalledTimes(1);
  expect(Sentry.sentryAddBreadcrumb).toHaveBeenCalledWith(breadcrumb);
});

it("SHOULD call sentryCaptureException", () => {
  const exception = new Error("exception");
  const extra = { extra: "extra" };

  captureException(exception, extra);

  expect(Sentry.sentryCaptureException).toHaveBeenCalledTimes(1);
  expect(Sentry.sentryCaptureException).toHaveBeenCalledWith(exception, extra);
});

it("SHOULD call sentryCaptureMessage", () => {
  const message = "message";
  const extra = { extra: "extra" };

  captureMessage(message, extra);

  expect(Sentry.sentryCaptureMessage).toHaveBeenCalledTimes(1);
  expect(Sentry.sentryCaptureMessage).toHaveBeenCalledWith(message, extra);
});

it("SHOULD call SentryWrapper", () => {
  const children = () => null;

  MonitoringWrapper(children);

  expect(Sentry.SentryWrapper).toHaveBeenCalledTimes(1);
  expect(Sentry.SentryWrapper).toHaveBeenCalledWith(children);
});

it("SHOULD return navigationIntegration", () => {
  expect(navigationIntegration).toEqual(Sentry.sentryNavigationIntegration());
});
