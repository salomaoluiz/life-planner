import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

describe("numbered steps", () => {
  it("SHOULD show every label, mark the current one and a check on the done ones", () => {
    setup();

    ["File", "Columns", "Values", "Review"].forEach((label) =>
      expect(screen.getByText(label)).toBeOnTheScreen(),
    );
    expect(
      screen.getByTestId("stepper-step-1").props.accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByTestId("stepper-step-0").props.accessibilityState.selected,
    ).toBe(false);
    // Done step: its number is replaced by a check.
    expect(screen.queryByText("1")).toBeNull();
    expect(screen.getByText("2")).toBeOnTheScreen();
    expect(screen.getByText("3")).toBeOnTheScreen();
  });

  it("SHOULD expose the progress to screen readers", () => {
    setup();

    expect(screen.getByTestId("stepper").props.accessibilityLabel).toBe(
      "Step 2 of 4: Columns",
    );
  });
});

describe("compact", () => {
  it("SHOULD show one bar per step as a progress bar", () => {
    setup({ compact: true });

    const bar = screen.getByTestId("stepper");

    expect(bar.props.accessibilityRole).toBe("progressbar");
    expect(bar.props.accessibilityValue).toEqual({ max: 4, min: 1, now: 2 });
    [0, 1, 2, 3].forEach((index) =>
      expect(screen.getByTestId(`stepper-step-${index}`)).toBeOnTheScreen(),
    );
    expect(screen.queryByText("File")).toBeNull();
  });
});
