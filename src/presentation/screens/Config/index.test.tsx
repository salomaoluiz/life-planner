import { screen } from "@tests";

import { setup, mocks } from "./mocks/index.mocks";

it("SHOULD render the config screen correctly", () => {
  setup();

  const title = screen.getByTestId("config-title");
  const darkMode = screen.getByTestId("dark-mode-container");
  const language = screen.getByTestId("language-container");  
  const logout = screen.getByTestId("logout-container");

  expect(title).toBeDefined();
  expect(darkMode).toBeDefined();
  expect(language).toBeDefined();
  expect(logout).toBeDefined();
});

it("SHOULD use translation hook correctly", () => {
  setup();

  expect(mocks.useTranslation.t).toHaveBeenCalledWith("configurations.title");
});

it("SHOULD render with spacer components", () => {
  setup();

  const spacers = screen.getAllByTestId("spacer");
  expect(spacers.length).toBeGreaterThan(0);
});