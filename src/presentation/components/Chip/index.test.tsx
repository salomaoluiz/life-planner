import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks/index.mocks";

function chip() {
  return screen.getByTestId("chip");
}
function style() {
  return StyleSheet.flatten(chip().props.style);
}

it("SHOULD be a 36 px pill that reaches 44 px with hitSlop and calls onPress", () => {
  setup();
  fireEvent.press(chip());
  expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  expect(style()).toEqual(
    expect.objectContaining({
      borderRadius: lightTheme.sizes.borderRadius.full,
      height: 36,
    }),
  );
  expect(chip().props.hitSlop).toEqual({ bottom: 4, top: 4 });
});

it("SHOULD use surface and border WHEN not selected", () => {
  setup();
  expect(style().backgroundColor).toBe(lightTheme.colors.surface);
  expect(style().borderColor).toBe(lightTheme.colors.border);
  expect(chip().props.accessibilityState.selected).toBe(false);
});

it("SHOULD use accentSoft and accent border WHEN selected", () => {
  setup({ selected: true });
  expect(style().backgroundColor).toBe(lightTheme.colors.accentSoft);
  expect(style().borderColor).toBe(lightTheme.colors.accent);
  expect(chip().props.accessibilityState.selected).toBe(true);
});

it("SHOULD render color dot, icon and count WHEN given", () => {
  setup({ colorDot: "#336699", count: 3, icon: "tag" });
  expect(screen.getByTestId("chip-dot")).toBeTruthy();
  expect(screen.getByTestId("chip-icon")).toBeTruthy();
  expect(screen.getByTestId("chip-count").props.children).toBe("3");
});

it("SHOULD show a plus icon WHEN variant is add", () => {
  setup({ variant: "add" });
  expect(screen.getByTestId("chip-icon")).toBeTruthy();
});

it("SHOULD render a zero count", () => {
  setup({ count: 0 });
  expect(screen.getByTestId("chip-count").props.children).toBe("0");
});
