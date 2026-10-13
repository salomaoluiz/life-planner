import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render label and value", () => {
  setup();
  expect(screen.getByTestId("metric-label").props.children).toBe("Income");
  expect(screen.getByText("R$ 10,00")).toBeTruthy();
});

it("SHOULD not render a trend icon by default", () => {
  setup();
  expect(screen.queryByTestId("metric-trend")).toBeNull();
});

it.each([
  ["income", "arrow-top-right"],
  ["expense", "arrow-bottom-right"],
] as const)("SHOULD render the %s trend as %s", (trend, name) => {
  setup({ trend });
  expect(screen.getByTestId("metric-trend").props.source).toBe(name);
});
