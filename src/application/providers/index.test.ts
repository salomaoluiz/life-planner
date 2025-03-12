import { screen, setup } from "./mocks/index.mocks";

it('SHOULD render "UserProvider" and "Children"', () => {
  setup();

  expect(screen.getByTestId("user-provider")).toBeOnTheScreen();
  expect(
    screen.getByTestId("application-providers-children"),
  ).toBeOnTheScreen();
});
