import { lightTheme } from "@presentation/theme/provider";

import loginTestIds from "../../testIds";
import { screen, setup } from "./mocks/index.mocks";

it("SHOULD render correctly", () => {
  setup();

  const welcome = screen.getByTestId(loginTestIds.welcome);

  expect(welcome).toBeOnTheScreen();
  expect(welcome).toHaveTextContent("login.welcome");
  expect(welcome).toHaveStyle({ color: lightTheme.colors.textPrimary });
});
