import { act, fireEvent, screen } from "@tests";

import { onChange, setup } from "./mocks/index.mocks";

const today = new Date();

it("SHOULD show label and placeholder WHEN there is no value", () => {
  setup();
  expect(screen.getByTestId("date-label").props.children).toBe("Date");
  expect(screen.getByTestId("date-value").props.children).toBe("Choose a date");
  expect(screen.queryByTestId("date-clear")).toBeNull();
});

it("SHOULD format the date for the active locale with a Today label", () => {
  setup({ value: today });
  expect(screen.getByTestId("date-value").props.children).toContain(
    String(today.getFullYear()),
  );
  expect(screen.getByTestId("date-relative").props.children).toBe("Today");
});

it("SHOULD label yesterday", () => {
  setup({ value: new Date(today.getTime() - 24 * 60 * 60 * 1000) });
  expect(screen.getByTestId("date-relative").props.children).toBe("Yesterday");
});

it("SHOULD show no relative label for other days", () => {
  setup({ value: new Date(2020, 5, 1) });
  expect(screen.queryByTestId("date-relative")).toBeNull();
});

it("SHOULD show the placeholder WHEN the date is invalid", () => {
  setup({ value: new Date("nope") });
  expect(screen.getByTestId("date-value").props.children).toBe("Choose a date");
});

it("SHOULD open the picker and confirm a date", () => {
  setup();
  fireEvent.press(screen.getByTestId("date"));
  const picker = screen.getByTestId("date-picker");
  expect(picker.props.visible).toBe(true);
  act(() => picker.props.onConfirm({ date: new Date(2025, 1, 2) }));
  expect(onChange).toHaveBeenCalledWith(new Date(2025, 1, 2));
});

it("SHOULD forward minDate and maxDate as the valid range", () => {
  const minDate = new Date(2025, 0, 1);
  const maxDate = new Date(2025, 11, 31);
  setup({ maxDate, minDate });
  fireEvent.press(screen.getByTestId("date"));
  expect(screen.getByTestId("date-picker").props.validRange).toEqual({
    endDate: maxDate,
    startDate: minDate,
  });
});

it("SHOULD clear the value WHEN clearable", () => {
  setup({ clearable: true, value: today });
  fireEvent.press(screen.getByTestId("date-clear"));
  expect(onChange).toHaveBeenCalledWith(undefined);
});

it("SHOULD show the error message", () => {
  setup({ error: "Required" });
  expect(screen.getByTestId("date-error").props.children).toBe("Required");
});
