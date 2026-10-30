import { fireEvent, render, screen } from "@tests";

import PeriodArrows from "./PeriodArrows";

const handlers = {
  onBackToToday: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
};

function setup(
  props: Partial<Parameters<typeof PeriodArrows>[0]> = {},
  compact = false,
) {
  render(
    <PeriodArrows
      canGoNext
      compact={compact}
      limitDate="31 Oct 2028"
      rangeLabel="1 Nov 2026 – 30 Apr 2027"
      showToday={false}
      {...handlers}
      {...props}
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the range AND call previous / next", () => {
  setup();

  expect(screen.getByTestId("financial.overview.period-range")).toBeTruthy();
  fireEvent.press(screen.getByTestId("financial.overview.period-previous"));
  fireEvent.press(screen.getByTestId("financial.overview.period-next"));
  expect(handlers.onPrevious).toHaveBeenCalledTimes(1);
  expect(handlers.onNext).toHaveBeenCalledTimes(1);
  expect(
    screen.queryByTestId("financial.overview.period-limit-hint"),
  ).toBeNull();
});

it("SHOULD disable next AND not call it WHEN the limit is reached (compact: hint caption)", () => {
  setup({ canGoNext: false }, true);

  const next = screen.getByTestId("financial.overview.period-next");

  expect(next.props.accessibilityState.disabled).toBe(true);
  fireEvent.press(next);
  expect(handlers.onNext).not.toHaveBeenCalled();
  expect(
    screen.getByTestId("financial.overview.period-limit-hint"),
  ).toBeTruthy();
});

it("SHOULD keep next disabled on wide screens (hint is the web tooltip)", () => {
  setup({ canGoNext: false });

  expect(
    screen.getByTestId("financial.overview.period-next").props
      .accessibilityState.disabled,
  ).toBe(true);
});

it("SHOULD show Today only WHEN the period is moved AND call it", () => {
  setup({ showToday: true });

  fireEvent.press(screen.getByTestId("financial.overview.period-today"));
  expect(handlers.onBackToToday).toHaveBeenCalledTimes(1);
});

it("SHOULD hide Today WHEN the period is not moved", () => {
  setup();

  expect(screen.queryByTestId("financial.overview.period-today")).toBeNull();
});
