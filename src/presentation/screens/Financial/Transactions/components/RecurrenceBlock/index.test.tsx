import { Text } from "react-native";

import { fireEvent, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD show the interval, the four units AND the preview", () => {
  setup({ endDate: new Date(2027, 10, 12) });
  expect(screen.getByTestId("block-interval").props.value).toBe("2");
  ["DAY", "WEEK", "MONTH", "YEAR"].forEach((unit) => {
    expect(screen.getByTestId(`block-unit.${unit}`)).toBeTruthy();
  });
  expect(
    screen.getByTestId("block-unit.MONTH").props.accessibilityState,
  ).toEqual(expect.objectContaining({ selected: true }));
  expect(screen.getByTestId("block-preview")).toBeTruthy();
  expect(screen.queryByTestId("block-error")).toBeNull();
});

it("SHOULD step the interval AND keep the unit", () => {
  setup();
  fireEvent.press(screen.getByTestId("block-interval-increase"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith({
    interval: 3,
    unit: "MONTH",
  });
  fireEvent.press(screen.getByTestId("block-interval-decrease"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith({
    interval: 1,
    unit: "MONTH",
  });
});

it("SHOULD keep the number WHEN it fits the new unit", () => {
  setup({ frequency: { interval: 3, unit: "WEEK" } });
  fireEvent.press(screen.getByTestId("block-unit.MONTH"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith({
    interval: 3,
    unit: "MONTH",
  });
});

it("SHOULD set the number to the new unit's maximum WHEN it does not fit", () => {
  setup({ frequency: { interval: 40, unit: "DAY" } });
  fireEvent.press(screen.getByTestId("block-unit.YEAR"));
  expect(defaultProps.onChange).toHaveBeenLastCalledWith({
    interval: 10,
    unit: "YEAR",
  });
});

it("SHOULD show the range error, disable plus AND hide the preview WHEN the number is out of range", () => {
  setup({ frequency: { interval: 25, unit: "MONTH" } });
  expect(screen.getByTestId("block-error")).toBeTruthy();
  expect(screen.queryByTestId("block-preview")).toBeNull();
  expect(
    screen.getByTestId("block-interval-increase").props.accessibilityState
      .disabled,
  ).toBe(true);
  expect(screen.getByTestId("block-interval").props["aria-describedby"]).toBe(
    "block-error",
  );
});

it("SHOULD flag 0 (an empty field) as out of range", () => {
  setup({ frequency: { interval: 0, unit: "DAY" } });
  expect(screen.getByTestId("block-error")).toBeTruthy();
});

it("SHOULD lock every control WHEN disabled", () => {
  setup({ disabled: true });
  fireEvent.press(screen.getByTestId("block-interval-increase"));
  fireEvent.press(screen.getByTestId("block-unit.WEEK"));
  expect(defaultProps.onChange).not.toHaveBeenCalled();
});

it("SHOULD render what the form puts between the hint and the preview", () => {
  setup({ children: <Text testID="block-end">end</Text> });
  expect(screen.getByTestId("block-end")).toBeTruthy();
});
