import { lightTheme } from "@presentation/theme/provider";

import { screen, setup } from "./mocks/index.mocks";

it("SHOULD render correctly", () => {
  setup();

  const welcome = screen.getByTestId("login_welcome");

  expect(welcome).toBeOnTheScreen();
  expect(welcome).toHaveTextContent("login.welcome");
  expect(welcome).toHaveStyle({ color: lightTheme.colors.onBackground });
});
