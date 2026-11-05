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

it("SHOULD draw the Today marker only WHEN asked (spec 053)", () => {
  setup();
  expect(screen.queryByTestId("line-today")).toBeNull();
  setup({ today: { index: 1, label: "Today" } });
  expect(screen.getByTestId("line-today")).toBeTruthy();
  expect(screen.getByText("Today")).toBeTruthy();
});

describe("several series (spec 094)", () => {
  const total = [
    { label: "Nov", projected: false, value: 1000 },
    { label: "Dec", projected: false, value: 1500 },
    { label: "Jan", projected: true, value: 1200 },
  ];
  const favorite = [
    { label: "Nov", projected: false, value: undefined },
    { label: "Dec", projected: false, value: -200 },
    { label: "Jan", projected: true, value: 300 },
  ];
  function lineWidths(width: number) {
    return screen.UNSAFE_root.findAll(
      (node) => node.props.strokeWidth === width && node.props.d,
    );
  }

  it("SHOULD draw a thick line for the primary series AND a thin muted one for the other", () => {
    setup({
      series: [
        { emphasis: "muted", points: total },
        { emphasis: "primary", points: favorite },
      ],
    });

    expect(screen.getByTestId("line-series-0")).toBeTruthy();
    expect(screen.getByTestId("line-series-1")).toBeTruthy();
    expect(lineWidths(3.5).length).toBeGreaterThan(0);
    expect(lineWidths(2).length).toBeGreaterThan(0);
    expect(
      lineWidths(2).every((node) => node.props.strokeOpacity === 0.75),
    ).toBe(true);
  });

  it("SHOULD start the line at the first point with a value AND never draw NaN", () => {
    setup({
      series: [{ emphasis: "primary", points: favorite }],
    });

    // Nov has no value: the Dec -> Jan crossing of zero gives two parts, never a part from Nov.
    expect(JSON.stringify(screen.toJSON())).not.toContain("NaN");
    expect(
      lineWidths(3.5).every((node) => !String(node.props.d).startsWith("M70 ")),
    ).toBe(true);
  });

  it("SHOULD keep the single points prop working as one primary series", () => {
    setup();

    expect(screen.getByTestId("line-series-0")).toBeTruthy();
    expect(screen.queryByTestId("line-series-1")).toBeNull();
  });

  it("SHOULD label each slot with the first series that has a value", () => {
    setup({
      series: [
        { emphasis: "primary", points: favorite },
        { emphasis: "muted", points: total },
      ],
    });

    expect(screen.getByLabelText("Nov, R$ 1000")).toBeTruthy();
    expect(screen.getByLabelText("Dec, R$ -200")).toBeTruthy();
  });
});
