import { fireEvent, screen } from "@tests";

import { onRetry, setup } from "./mocks/index.mocks";

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the title, subtitle, legend, children and footnote when ready", () => {
  setup({
    footnote: "Note",
    legend: [
      { label: "Actual", tone: "accent" },
      { dashed: true, label: "Expected", tone: "accent" },
    ],
    subtitle: "Sub",
  });
  expect(screen.getByText("By category")).toBeTruthy();
  expect(screen.getByText("Sub")).toBeTruthy();
  expect(screen.getByText("Actual")).toBeTruthy();
  expect(screen.getByText("Expected")).toBeTruthy();
  expect(screen.getByText("chart")).toBeTruthy();
  expect(screen.getByTestId("card-footnote")).toBeTruthy();
});

it("SHOULD show the error with a retry AND hide the chart", () => {
  setup({ state: "error" });
  expect(screen.getByText("Could not load")).toBeTruthy();
  expect(screen.queryByText("chart")).toBeNull();
  fireEvent.press(screen.getByText("Try again"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show the empty text AND the skeleton while loading", () => {
  setup({ emptyText: "Nothing", state: "empty" });
  expect(screen.getByTestId("card-empty").props.children).toBe("Nothing");
  setup({ state: "loading" });
  expect(screen.getAllByTestId("skeleton-loader").length).toBeGreaterThan(0);
});

it("SHOULD draw an icon before a legend label AND fade a muted swatch (spec 094)", () => {
  setup({
    legend: [
      { icon: "star", label: "Checking · favorite", tone: "income" },
      { label: "Total", muted: true, tone: "neutral" },
    ],
  });

  expect(screen.getByTestId("card-legend-icon-0").props.source).toBe("star");
  expect(screen.queryByTestId("card-legend-icon-1")).toBeNull();
  expect(screen.getByTestId("card-legend-swatch-1").props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]),
  );
});
