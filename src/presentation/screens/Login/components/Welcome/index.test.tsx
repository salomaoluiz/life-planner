import { setup, screen } from "./mocks/index.mocks";
import { lightTheme } from "@presentation/theme/provider";

it("SHOULD render correctly", () => {
  setup();

  const welcome = screen.getByTestId("login_welcome");

  expect(welcome).toBeOnTheScreen();
  expect(welcome).toHaveTextContent("login.welcome");
  expect(welcome).toHaveStyle({ color: lightTheme.colors.onBackground });
});
