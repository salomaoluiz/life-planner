import { mocks, setup, screen } from "./mocks/index.mocks";

it("SHOULD render correctly", () => {
  setup();

  const welcome = screen.getByTestId("login_welcome");
  const googleButton = screen.getByTestId("login_googleButton");

  expect(welcome).toBeOnTheScreen();
  expect(googleButton).toBeOnTheScreen();
  expect(googleButton.props.onPress).toEqual(
    mocks.defaultProps.onGoogleButtonPress,
  );
});
