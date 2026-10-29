import { fireEvent, screen } from "@tests";

import { onSelect, setup } from "./mocks/index.mocks";

beforeEach(() => jest.clearAllMocks());

it("SHOULD describe the chart AND expose one pressable item per point", () => {
  setup();
  expect(screen.getByTestId("line").props.accessibilityLabel).toBe(
    "Balance from Nov to Jan",
  );
  expect(screen.getAllByLabelText(/^(Nov|Dec|Jan), R\$ /)).toHaveLength(3);
});

it("SHOULD select a point by press", () => {
  setup();
  fireEvent.press(screen.getByTestId("line-point-1"));
  expect(onSelect).toHaveBeenCalledWith(1);
});

it("SHOULD draw all-zero, single-point and empty data without NaN", () => {
  setup({ points: [{ label: "Nov", projected: false, value: 0 }] });
  setup({ points: [] });
  setup({
    points: [
      { label: "A", projected: false, value: 0 },
      { label: "B", projected: false, value: 0 },
    ],
    selectedIndex: 1,
  });
  expect(JSON.stringify(screen.toJSON())).not.toContain("NaN");
});

it("SHOULD reserve the width of the longest y-axis label so it is not clipped", () => {
  setup({
    formatTick: (value: number) => `R$ ${value / 100} mil mil mil`,
    points: [
      { label: "Nov", projected: false, value: 15_000_000 },
      { label: "Dec", projected: false, value: 16_000_000 },
    ],
  });
  const labels = screen.UNSAFE_root.findAll(
    (node) => node.props.textAnchor === "end",
  );

  expect(labels.length).toBeGreaterThan(0);
  expect(
    Math.min(...labels.map((node) => Number(node.props.x))),
  ).toBeGreaterThanOrEqual("R$ 160000 mil mil mil".length * 11 * 0.6);
});
