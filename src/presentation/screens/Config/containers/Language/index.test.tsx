import { screen } from "@tests";

import { setup } from "./mocks/Language.mocks";

it("SHOULD render Language title", () => {
  setup();

  expect(screen.getByTestId("text-title")).toBeDefined();
});

it("SHOULD render Picker component", () => {
  setup();

  expect(screen.getByTestId("picker")).toBeDefined();
});

it("SHOULD render Spacer component", () => {
  setup();

  expect(screen.getByTestId("spacer")).toBeDefined();
});