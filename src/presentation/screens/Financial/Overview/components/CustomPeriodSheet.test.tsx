import { fireEvent, render, screen } from "@tests";

import { useBreakpoint } from "@presentation/theme";

import CustomPeriodSheet from "./CustomPeriodSheet";

const onApply = jest.fn();

function setup(
  initial = { from: "2026-01-01", to: "2026-03-31" },
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  render(
    <CustomPeriodSheet
      initial={initial}
      onApply={onApply}
      onClose={jest.fn()}
      today="2026-10-29"
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD apply a valid range", () => {
  setup();

  fireEvent.press(screen.getByTestId("financial.overview.custom-apply"));
  expect(onApply).toHaveBeenCalledWith({
    from: "2026-01-01",
    to: "2026-03-31",
  });
});

it("SHOULD show the error AND not apply a range over 2 years or past the end of the month", () => {
  setup({ from: "2024-01-01", to: "2026-10-31" });

  expect(
    screen.getByTestId("financial.overview.custom-error"),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("financial.overview.custom-apply"));
  expect(onApply).not.toHaveBeenCalled();
});

it("SHOULD accept an end on the 24-month limit AND refuse the next month, showing the limit (spec 053)", () => {
  setup({ from: "2027-01-01", to: "2028-10-31" });
  expect(screen.queryByTestId("financial.overview.custom-error")).toBeNull();
  fireEvent.press(screen.getByTestId("financial.overview.custom-apply"));
  expect(onApply).toHaveBeenCalledWith({
    from: "2027-01-01",
    to: "2028-10-31",
  });
});

it("SHOULD show the 24-month limit as the error for a later end (spec 053)", () => {
  setup({ from: "2027-01-01", to: "2028-11-30" });
  expect(
    screen.getByTestId("financial.overview.custom-error").props.children,
  ).toContain("2028-10-31");
  fireEvent.press(screen.getByTestId("financial.overview.custom-apply"));
  expect(onApply).not.toHaveBeenCalled();
});

it("SHOULD split From and To into two columns on wide layouts only (spec 053)", () => {
  setup(undefined, "expanded");
  expect(
    screen.getByTestId("financial.overview.custom-sheet-column-left"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("financial.overview.custom-sheet-column-right"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("financial.overview.custom-cancel"),
  ).toBeOnTheScreen();
});

it("SHOULD keep the compact stack on phones (spec 053)", () => {
  setup(undefined, "compact");
  expect(
    screen.queryByTestId("financial.overview.custom-sheet-column-left"),
  ).toBeNull();
});

describe("a module with its own rule (spec 110)", () => {
  function setupCustom(initial: { from: string; to: string }) {
    jest.mocked(useBreakpoint).mockReturnValue("compact");
    render(
      <CustomPeriodSheet
        errorText={(date) => `until ${date}`}
        hint="Up to 10 years"
        initial={initial}
        maxDate="2026-10-29"
        onApply={onApply}
        onClose={jest.fn()}
        testIdPrefix="investment.overview"
        today="2026-10-29"
        validate={(from, to) =>
          to > "2026-10-29" ? { maxTo: "2026-10-29", ok: false } : { ok: true }
        }
      />,
    );
  }

  it("SHOULD apply a range its rule accepts, with its own testIDs AND hint", () => {
    setupCustom({ from: "2020-01-01", to: "2026-10-29" });

    expect(screen.getByText("Up to 10 years")).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId("investment.overview.custom-apply"));

    expect(onApply).toHaveBeenCalledWith({
      from: "2020-01-01",
      to: "2026-10-29",
    });
  });

  it("SHOULD refuse a range its rule rejects AND say until when", () => {
    setupCustom({ from: "2026-01-01", to: "2026-12-31" });

    expect(screen.getByText("until 2026-10-29")).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId("investment.overview.custom-apply"));

    expect(onApply).not.toHaveBeenCalled();
  });
});
