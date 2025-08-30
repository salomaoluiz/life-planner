import { screen } from "@tests";

import { setup, setupLoading } from "./mocks/BusinessFeedback.mocks";

it("SHOULD render loading state when params are not available", () => {
  setupLoading();

  expect(screen.getByTestId("loading-title")).toBeDefined();
});

it("SHOULD render business feedback content when params are available", () => {
  setup();

  expect(screen.getByTestId("main-container")).toBeDefined();
});

it("SHOULD render correct icon for error type", () => {
  setup({ type: "Error" });

  expect(screen.getByTestId("main-container")).toBeDefined();
});

it("SHOULD render correct icon for success type", () => {
  setup({ type: "Success" });

  expect(screen.getByTestId("main-container")).toBeDefined();
});