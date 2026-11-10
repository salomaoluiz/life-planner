import { GenericError } from "@domain/entities/errors";

import { mocks, screen, setup, spies } from "./mocks/errorBoundary.mocks";

it("SHOULD render correctly", () => {
  setup();

  expect(screen.getByTestId("mocked-children")).toBeTruthy();
  expect(screen.getByTestId("sentry-error-boundary")).toBeTruthy();
});

it("SHOULD pass the fallback as props correctly", () => {
  setup();

  const sentryErrorBoundary = screen.getByTestId("sentry-error-boundary");
  const fakeFallbackProp = {
    error: new Error("some error"),
    resetError: jest.fn(),
  };
  const fallbackProp = sentryErrorBoundary.props.fallback(fakeFallbackProp);
  const { FallbackComponent } = mocks;

  expect(fallbackProp).toEqual(
    <FallbackComponent
      error={fakeFallbackProp.error}
      retry={fakeFallbackProp.resetError}
    />,
  );
});

it('SHOULD call "beforeCapture" with the scope and the error', () => {
  setup();

  const sentryErrorBoundary = screen.getByTestId("sentry-error-boundary");
  const fakeScope = {};
  const fakeError = new GenericError();

  sentryErrorBoundary.props.beforeCapture(fakeScope, fakeError);

  expect(spies.beforeCapture).toHaveBeenCalledTimes(1);
  expect(spies.beforeCapture).toHaveBeenCalledWith(fakeScope, fakeError);
});

it('SHOULD call "beforeCapture" for any error', () => {
  setup();

  const sentryErrorBoundary = screen.getByTestId("sentry-error-boundary");
  const fakeScope = {};
  const fakeError = new Error("some error");

  sentryErrorBoundary.props.beforeCapture(fakeScope, fakeError);

  expect(spies.beforeCapture).toHaveBeenCalledWith(fakeScope, fakeError);
});
