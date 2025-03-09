import { View } from "react-native";

jest.mock("./sentry");

import * as Sentry from "./sentry";
import {
  captureException,
  initializeMonitoring,
  MonitoringWrapper,
  addBreadcrumb,
  captureMessage,
  navigationIntegration,
  ErrorBoundary,
  setContext,
  setTag,
  setUser,
} from "./";
import { render, act } from "@tests";
import { GenericError } from "@domain/entities/errors";

beforeEach(() => {
  jest.clearAllMocks();
});
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

it("SHOULD call sentrySetContext", () => {
  const context = "context";
  const data = { data: "data" };

  setContext(context, data);

  expect(Sentry.sentrySetContext).toHaveBeenCalledTimes(1);
  expect(Sentry.sentrySetContext).toHaveBeenCalledWith(context, data);
});

it("SHOULD call sentrySetTag", () => {
  const key = "key";
  const tag = "value";

  setTag(key, tag);

  expect(Sentry.sentrySetTag).toHaveBeenCalledTimes(1);
  expect(Sentry.sentrySetTag).toHaveBeenCalledWith(key, tag);
});

it("SHOULD call sentrySetUser", () => {
  const user = { id: "id" };

  setUser(user);

  expect(Sentry.sentrySetUser).toHaveBeenCalledTimes(1);
  expect(Sentry.sentrySetUser).toHaveBeenCalledWith(user);
});

it("SHOULD call SentryErrorBoundary", () => {
  const Children = <View />;
  const FallbackComponent = () => null;

  const beforeCapture = jest.fn();

  render(
    <ErrorBoundary
      beforeCapture={beforeCapture}
      FallbackComponent={FallbackComponent}
    >
      {Children}
    </ErrorBoundary>,
  );

  expect(Sentry.SentryErrorBoundary).toHaveBeenCalledTimes(1);
  expect(Sentry.SentryErrorBoundary).toHaveBeenCalledWith(
    {
      beforeCapture: expect.any(Function),
      FallbackComponent,
      children: Children,
    },
    {},
  );
});

it('SHOULD call setContext in beforeCapture with "error-boundary-context"', () => {
  const Children = <View />;
  const FallbackComponent = () => null;

  const beforeCapture = jest.fn();

  render(
    <ErrorBoundary
      beforeCapture={beforeCapture}
      FallbackComponent={FallbackComponent}
    >
      {Children}
    </ErrorBoundary>,
  );

  const genericError = new GenericError();
  genericError.addContext({ fake: "context" });

  act(() =>
    (Sentry.SentryErrorBoundary as jest.Mock).mock.calls[0][0].beforeCapture(
      {},
      genericError,
    ),
  );

  expect(Sentry.sentrySetContext).toHaveBeenCalledTimes(1);
  expect(Sentry.sentrySetContext).toHaveBeenCalledWith(
    "error-boundary-context",
    { fake: "context" },
  );
});
