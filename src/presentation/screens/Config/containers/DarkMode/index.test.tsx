import { screen } from "@tests";

import { setup } from "./mocks/DarkMode.mocks";

it("SHOULD render DarkMode title", () => {
  setup();

  expect(screen.getByTestId("text-title")).toBeDefined();
});

it("SHOULD render Switch component", () => {
  setup();

  expect(screen.getByTestId("switch")).toBeDefined();
});

it("SHOULD render Spacer component", () => {
  setup();

  expect(screen.getByTestId("spacer")).toBeDefined();
});