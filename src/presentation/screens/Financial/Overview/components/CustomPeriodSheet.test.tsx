import { fireEvent, render, screen } from "@tests";

import CustomPeriodSheet from "./CustomPeriodSheet";

const onApply = jest.fn();

function setup(initial = { from: "2026-01-01", to: "2026-03-31" }) {
  render(
    <CustomPeriodSheet
      initial={initial}
      onApply={onApply}
      onClose={jest.fn()}
      today="2026-10-20"
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
