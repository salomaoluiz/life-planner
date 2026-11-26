import { fireEvent, screen } from "@tests";

import { onChange, setup } from "./mocks/index.mocks";

it("SHOULD show the path of the current value with its ancestors muted", () => {
  setup();
  expect(screen.getByTestId("field-value").props.children).toBe("Market");
  expect(screen.getByTestId("field-ancestors").props.children).toBe("Food › ");
});

it("SHOULD always chip the current value even when it is not most used", () => {
  setup();
  expect(screen.getByTestId("field-chips-market")).toBeTruthy();
  expect(screen.getByTestId("field-chips-home")).toBeTruthy();
});

it("SHOULD select from a chip", () => {
  setup();
  fireEvent.press(screen.getByTestId("field-chips-home"));
  expect(onChange).toHaveBeenCalledWith("home");
});

it("SHOULD open the picker from More and from the field", () => {
  setup();
  fireEvent.press(screen.getByTestId("field-chips-__more__"));
  expect(screen.getByTestId("field-picker-search")).toBeTruthy();
});

it("SHOULD badge an archived current value and keep it out of the picker", () => {
  setup({ value: "old" });
  expect(screen.getByTestId("field-archived")).toBeTruthy();
  fireEvent.press(screen.getByTestId("field"));
  expect(screen.queryByTestId("field-picker-option-old")).toBeNull();
});

it("SHOULD show the none label when an optional field is empty", () => {
  setup({ value: undefined });
  expect(screen.getByTestId("field-value").props.children).toBe("No category");
});

it("SHOULD show removable chips in multiple mode", () => {
  const onMulti = jest.fn();

  setup({ mode: "multiple", onChange: onMulti, value: ["home"] });
  fireEvent.press(screen.getByTestId("field-chip-home-remove"));
  expect(onMulti).toHaveBeenCalledWith([]);
});
