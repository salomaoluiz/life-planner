import {
  mocks,
  spies,
  setup,
  screen,
  fireEvent,
} from "./mocks/index.web.mocks";

it("SHOULD render correctly", () => {
  setup();

  const googleButton = screen.getByTestId("login_googleButton");
  const welcome = screen.getByTestId("login_welcome");

  expect(welcome).toBeOnTheScreen();
  expect(googleButton).toBeOnTheScreen();
});

it("SHOULD call the hooks on render", () => {
  setup();

  expect(spies.useLogin).toHaveBeenCalledTimes(1);
  expect(spies.useLogin).toHaveBeenCalledWith();
  expect(spies.useSaveSession).toHaveBeenCalledTimes(1);
  expect(spies.useSaveSession).toHaveBeenCalledWith();
});

it("SHOULD call onGoogleButtonPress on button press", () => {
  setup();

  const googleButton = screen.getByTestId("login_googleButton");

  fireEvent(googleButton, "press");

  expect(mocks.useLogin.onGoogleButtonPress).toHaveBeenCalled();
});
