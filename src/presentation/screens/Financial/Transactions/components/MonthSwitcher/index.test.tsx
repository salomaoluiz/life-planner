import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD show the month label and open the picker WHEN pressed", () => {
  const { onMonthPress } = setup();

  fireEvent.press(screen.getByText("October 2026"));

  expect(onMonthPress).toHaveBeenCalledTimes(1);
});

it("SHOULD call onPrevious from the labelled previous button", () => {
  const { onPrevious } = setup();

  fireEvent.press(screen.getByLabelText("Previous month"));

  expect(onPrevious).toHaveBeenCalledTimes(1);
});

it("SHOULD call onNext from the labelled next button", () => {
  const { onNext } = setup();

  fireEvent.press(screen.getByLabelText("Next month"));

  expect(onNext).toHaveBeenCalledTimes(1);
});
