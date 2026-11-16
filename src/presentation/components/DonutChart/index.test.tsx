import { fireEvent, screen } from "@tests";

import { onSelect, setup } from "./mocks/index.mocks";

beforeEach(() => jest.clearAllMocks());

it("SHOULD describe the chart AND show the centre", () => {
  setup();

  expect(screen.getByTestId("donut").props.accessibilityLabel).toBe(
    "Allocation by class",
  );
  expect(screen.getByText("Total")).toBeOnTheScreen();
  expect(screen.getByText("R$ 184 mil")).toBeOnTheScreen();
});

it("SHOULD draw one slice per class with a positive value", () => {
  setup({
    slices: [
      { color: "#111111", id: "A", label: "A", value: 10 },
      { color: "#222222", id: "B", label: "B", value: 0 },
      { color: "#333333", id: "C", label: "C", value: -5 },
    ],
  });

  expect(screen.getByTestId("donut-slice-A")).toBeOnTheScreen();
  expect(screen.queryByTestId("donut-slice-B")).toBeNull();
  expect(screen.queryByTestId("donut-slice-C")).toBeNull();
});

it("SHOULD select a class by pressing its slice", () => {
  setup();

  fireEvent.press(screen.getByTestId("donut-slice-BR_REIT"));

  expect(onSelect).toHaveBeenCalledWith("BR_REIT");
});

it("SHOULD outline only the selected slice", () => {
  setup();
  expect(screen.queryByTestId("donut-selected")).toBeNull();

  screen.unmount();
  setup({ selectedId: "FOREIGN_STOCK" });

  expect(screen.getByTestId("donut-selected")).toBeOnTheScreen();
});

it("SHOULD draw empty, all-zero and single-slice data without NaN", () => {
  setup({ slices: [] });
  setup({ slices: [{ color: "#111111", id: "A", label: "A", value: 0 }] });
  setup({ slices: [{ color: "#111111", id: "A", label: "A", value: 7 }] });

  expect(JSON.stringify(screen.toJSON())).not.toContain("NaN");
});
