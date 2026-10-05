import { fireEvent, render, screen } from "@tests";

import { ErrorState } from "@components";
import { lightTheme } from "@presentation/theme/provider";

const onRetry = jest.fn();

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the message and a retry button that calls onRetry", () => {
  render(
    <ErrorState
      message="Failed"
      onRetry={onRetry}
      retryLabel="Try again"
      testID="error"
    />,
  );
  expect(screen.getByTestId("error-message").props.children).toBe("Failed");
  fireEvent.press(screen.getByTestId("error-action"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD use the expense tone for the icon tile", () => {
  render(
    <ErrorState
      message="Failed"
      onRetry={onRetry}
      retryLabel="Try again"
      testID="error"
    />,
  );
  expect(screen.getByTestId("error-tile-icon").props.color).toBe(
    lightTheme.colors.expense,
  );
});

it("SHOULD render the optional title", () => {
  render(
    <ErrorState
      message="Failed"
      onRetry={onRetry}
      retryLabel="Retry"
      testID="error"
      title="Oops"
    />,
  );
  expect(screen.getByTestId("error-title").props.children).toBe("Oops");
});
