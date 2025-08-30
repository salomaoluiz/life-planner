import { screen } from "@tests";

import { setup, setupLoading } from "./mocks/index.mocks";

it("SHOULD render loading state when data is not available", () => {
  setupLoading();

  expect(screen.getByTestId("loading-title")).toBeDefined();
});

it("SHOULD render invite content when data is available", () => {
  setup();

  expect(screen.getByTestId("invite-display")).toBeDefined();
  expect(screen.getByTestId("family-name")).toBeDefined();
  expect(screen.getByTestId("accept-button")).toBeDefined();
  expect(screen.getByTestId("decline-button")).toBeDefined();
});

it("SHOULD render spacers between elements", () => {
  setup();

  const spacers = screen.getAllByTestId("spacer");
  expect(spacers.length).toBeGreaterThan(0);
});

it("SHOULD show warning message when invite is not for current user", () => {
  setup({ isSamePerson: false });

  expect(screen.getByTestId("not-same-person-warning")).toBeDefined();
});

it("SHOULD disable accept button when invite is not for current user", () => {
  setup({ isSamePerson: false });

  const acceptButton = screen.getByTestId("accept-button");
  expect(acceptButton.props.disabled).toBe(true);
});