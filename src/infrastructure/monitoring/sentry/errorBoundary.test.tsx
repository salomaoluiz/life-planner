import { setup, mocks, screen } from "./mocks/errorBoundary.mock";

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
