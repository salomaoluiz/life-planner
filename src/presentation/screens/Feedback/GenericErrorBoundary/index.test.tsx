import { act, fireEvent, screen, setup, spies } from "./mocks/index.mocks";

it("SHOULD render the component", () => {
  setup();

  expect(screen.getByTestId("genericErrorBoundary_title")).toBeOnTheScreen();
  expect(
    screen.getByTestId("genericErrorBoundary_description"),
  ).toBeOnTheScreen();
  expect(screen.getByTestId("genericErrorBoundary_button")).toBeOnTheScreen();
});

it("SHOULD call retry when button is pressed", () => {
  setup();

  act(() => {
    fireEvent.press(screen.getByTestId("genericErrorBoundary_button"));
  });

  expect(spies.retry).toHaveBeenCalledTimes(1);
});
