import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render the label and the value", () => {
  setup();
  expect(screen.getByTestId("tile-label").props.children).toBe("Income");
  expect(screen.getByTestId("tile-value").props.children).toBe("R$ 10,00");
  expect(screen.queryByTestId("tile-delta")).toBeNull();
});

it("SHOULD render the delta AND describe the tile for screen readers", () => {
  setup({ delta: { text: "▲ 8,4%", tone: "good" } });
  expect(screen.getByTestId("tile-delta").props.children).toBe("▲ 8,4%");
  expect(screen.getByTestId("tile").props.accessibilityLabel).toBe(
    "Income: R$ 10,00, ▲ 8,4%",
  );
});

it("SHOULD render a skeleton while loading", () => {
  setup({ loading: true });
  expect(screen.getByTestId("tile-loading")).toBeTruthy();
  expect(screen.queryByTestId("tile-value")).toBeNull();
});
