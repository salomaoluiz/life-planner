import { fireEvent, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD step down AND up by one", () => {
  setup();
  fireEvent.press(screen.getByTestId("stepper-decrease"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith(1);
  fireEvent.press(screen.getByTestId("stepper-increase"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith(3);
});

it("SHOULD disable minus at the minimum AND plus at the maximum", () => {
  setup({ value: 1 });
  expect(
    screen.getByTestId("stepper-decrease").props.accessibilityState.disabled,
  ).toBe(true);
  expect(
    screen.getByTestId("stepper-increase").props.accessibilityState.disabled,
  ).toBe(false);
});

it("SHOULD disable plus at the maximum", () => {
  setup({ value: 24 });
  expect(
    screen.getByTestId("stepper-increase").props.accessibilityState.disabled,
  ).toBe(true);
});

it("SHOULD report a typed number AND report 0 for an empty field", () => {
  setup();
  fireEvent.changeText(screen.getByTestId("stepper"), "30");
  expect(defaultProps.onChange).toHaveBeenLastCalledWith(30);
  fireEvent.changeText(screen.getByTestId("stepper"), "");
  expect(defaultProps.onChange).toHaveBeenLastCalledWith(0);
  fireEvent.changeText(screen.getByTestId("stepper"), "1a2");
  expect(defaultProps.onChange).toHaveBeenLastCalledWith(12);
});

it("SHOULD go to the minimum WHEN plus is pressed on an empty value", () => {
  setup({ value: 0 });
  fireEvent.press(screen.getByTestId("stepper-increase"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith(1);
});

it("SHOULD label the buttons AND the input for screen readers", () => {
  setup({ describedBy: "stepper-error" });
  expect(screen.getByLabelText("Decrease")).toBeTruthy();
  expect(screen.getByLabelText("Increase")).toBeTruthy();
  expect(screen.getByTestId("stepper").props.accessibilityLabel).toBe(
    "Interval",
  );
  expect(screen.getByTestId("stepper").props["aria-describedby"]).toBe(
    "stepper-error",
  );
});

it("SHOULD not react WHEN disabled", () => {
  setup({ disabled: true });
  fireEvent.press(screen.getByTestId("stepper-increase"));
  expect(defaultProps.onChange).not.toHaveBeenCalled();
});
