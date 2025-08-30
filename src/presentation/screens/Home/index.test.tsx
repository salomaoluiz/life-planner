import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render Home screen with ScrollView", () => {
  setup();

  expect(screen.getByTestId("scroll-view")).toBeDefined();
});

it("SHOULD render StockDashboard component", () => {
  setup();

  expect(screen.getByTestId("stock-dashboard")).toBeDefined();
});