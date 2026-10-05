import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD show the title and the year", () => {
  setup();

  expect(screen.getByText("Choose month")).toBeOnTheScreen();
  expect(screen.getByText("2026")).toBeOnTheScreen();
});

it("SHOULD change the year with the labelled buttons", () => {
  const { onYearChange } = setup();

  fireEvent.press(screen.getByLabelText("Previous year"));
  fireEvent.press(screen.getByLabelText("Next year"));

  expect(onYearChange).toHaveBeenNthCalledWith(1, -1);
  expect(onYearChange).toHaveBeenNthCalledWith(2, 1);
});

it("SHOULD list 12 month chips and select one", () => {
  const { onSelect } = setup({ selected: "0" });

  expect(screen.getAllByText(/^M\d+$/)).toHaveLength(12);
  fireEvent.press(screen.getByText("M3"));

  expect(onSelect).toHaveBeenCalledWith("2");
});

it("SHOULD mark the selected month", () => {
  setup({ selected: "4" });

  expect(screen.getByLabelText("M5").props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );
});

it("SHOULD call onClose from the close button", () => {
  const { onClose } = setup();

  fireEvent.press(screen.getAllByLabelText("Close")[0]);

  expect(onClose).toHaveBeenCalledTimes(1);
});
