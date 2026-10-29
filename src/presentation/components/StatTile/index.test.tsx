import { fireEvent, screen } from "@tests";

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

it("SHOULD never cut the value with an ellipsis AND wrap the delta on two lines", () => {
  setup({ delta: { note: "vs previous", text: "▲ 8,4%", tone: "good" } });
  expect(screen.getByTestId("tile-value").props.numberOfLines).toBeUndefined();
  expect(screen.getByTestId("tile-delta").props.numberOfLines).toBe(2);
});

it("SHOULD show the compact value in a narrow tile AND keep the full value in the accessibility label", () => {
  setup({ compactValue: "R$ 312 mil", value: "R$ 312.480,55" });
  fireEvent(screen.getByTestId("tile-value-area"), "layout", {
    nativeEvent: { layout: { height: 30, width: 80 } },
  });
  expect(screen.getByTestId("tile-value").props.children).toBe("R$ 312 mil");
  expect(screen.getByTestId("tile").props.accessibilityLabel).toContain(
    "R$ 312.480,55",
  );
});
