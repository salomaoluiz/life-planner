import { mocks, spies, setup, screen, fireEvent } from "./mocks/index.mocks";

it("SHOULD render correctly", () => {
  setup();

  const welcome = screen.getByTestId("login_welcome");
  const googleButton = screen.getByTestId("login_googleButton");

  expect(welcome).toBeOnTheScreen();
  expect(googleButton).toBeOnTheScreen();
});

it("SHOULD call onGoogleButtonPress on button press", () => {
  setup();

  const googleButton = screen.getByTestId("login_googleButton");

  fireEvent(googleButton, "press");

  expect(mocks.useLogin.onGoogleButtonPress).toHaveBeenCalled();
});

it("SHOULD call useLogin hook", () => {
  setup();

  expect(spies.useLogin).toHaveBeenCalledTimes(1);
  expect(spies.useLogin).toHaveBeenCalledWith();
});
