import { screen } from "@tests";

import { defaultData, setup, setupLoading } from "./mocks/StockDashboard.mocks";

it("SHOULD render loading skeleton when fetching", () => {
  setupLoading();

  // Check for the loading container View
  const containers = screen.getAllByTestId("test-view");
  expect(containers.length).toBeGreaterThan(0);
  expect(screen.getByTestId("skeleton-box")).toBeDefined();
});

it("SHOULD render stock dashboard data when loaded", () => {
  setup();

  // Check for the main container View
  const containers = screen.getAllByTestId("test-view");
  expect(containers.length).toBeGreaterThan(0);
  expect(screen.getByTestId("dashboard-title")).toBeDefined();
  expect(screen.getByTestId("total-items")).toBeDefined();
  expect(screen.getByTestId("expired-items")).toBeDefined();
});

it("SHOULD display correct item quantities", () => {
  setup();

  const totalItems = screen.getByTestId("total-items");
  const expiredItems = screen.getByTestId("expired-items");

  expect(totalItems.props.value).toContain("Total items:");
  expect(expiredItems.props.value).toContain("Expired items:");
});

it("SHOULD render spacers between elements", () => {
  setup();

  const spacers = screen.getAllByTestId("spacer");
  expect(spacers).toHaveLength(2);
});