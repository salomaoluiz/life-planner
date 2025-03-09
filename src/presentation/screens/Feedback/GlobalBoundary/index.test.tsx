import {
  spies,
  setup,
  screen,
  act,
  fireEvent,
  mocks,
} from "./mocks/index.mocks";

it("SHOULD render the component", () => {
  setup();

  expect(screen.getByTestId("globalBoundary_title")).toBeOnTheScreen();
  expect(screen.getByTestId("globalBoundary_description")).toBeOnTheScreen();
  expect(screen.getByTestId("globalBoundary_button")).toBeOnTheScreen();
});

it("SHOULD call retry function when button is pressed", () => {
  setup();

  const button = screen.getByTestId("globalBoundary_button");

  act(() => {
    fireEvent.press(button);
  });
  expect(spies.retry).toHaveBeenCalledTimes(1);
});

it("SHOULD call getString function when component is mounted", async () => {
  setup();

  expect(spies.getString).toHaveBeenCalledTimes(1);
  expect(spies.getString).toHaveBeenCalledWith(mocks.fallbackKey);
});
