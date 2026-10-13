import { StyleSheet } from "react-native";

import { fireEvent, mockDarkTheme, screen } from "@tests";

import colors from "@presentation/theme/constants/colors";
import { lightTheme } from "@presentation/theme/provider";

import { onChange, setup, setupAccent } from "./mocks/index.mocks";

it("SHOULD expose a tablist with selected state and call onChange for the other segment", () => {
  setup();
  expect(screen.getByTestId("seg").props.accessibilityRole).toBe("tablist");
  expect(screen.getByTestId("seg").props.accessibilityLabel).toBe("Type");
  expect(
    screen.getByTestId("seg-expense").props.accessibilityState.selected,
  ).toBe(true);
  fireEvent.press(screen.getByTestId("seg-income"));
  expect(onChange).toHaveBeenCalledWith("income");
});

it("SHOULD not call onChange WHEN disabled AND keep the selected state", () => {
  setup("expense", true);
  fireEvent.press(screen.getByTestId("seg-income"));
  expect(onChange).not.toHaveBeenCalled();
  expect(
    screen.getByTestId("seg-income").props.accessibilityState.disabled,
  ).toBe(true);
  expect(
    screen.getByTestId("seg-expense").props.accessibilityState.selected,
  ).toBe(true);
});

it("SHOULD not call onChange for the already selected segment", () => {
  setup();
  fireEvent.press(screen.getByTestId("seg-expense"));
  expect(onChange).not.toHaveBeenCalled();
});

it("SHOULD paint the selected label with its tone and the selected segment on surface", () => {
  setup("income");
  const label = screen.getByTestId("seg-income-label");
  expect(StyleSheet.flatten(label.props.style).color).toBe(
    lightTheme.colors.income,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("seg-income").props.style)
      .backgroundColor,
  ).toBe(lightTheme.colors.surface);
});

it("SHOULD paint the unselected label with textSecondary", () => {
  setup("income");
  expect(
    StyleSheet.flatten(screen.getByTestId("seg-expense-label").props.style)
      .color,
  ).toBe(lightTheme.colors.textSecondary);
});

it("SHOULD give the selected segment a raised fill, an edge and a primary label WHEN dark", () => {
  const restore = mockDarkTheme();
  setup("expense");
  const segment = StyleSheet.flatten(
    screen.getByTestId("seg-expense").props.style,
  );

  expect(segment.backgroundColor).toBe(colors.dark.surfaceRaised);
  expect(segment.borderWidth).toBe(1);
  expect(segment.borderColor).toBe(colors.dark.border);
  expect(
    StyleSheet.flatten(screen.getByTestId("seg").props.style).backgroundColor,
  ).toBe(colors.dark.surface);
  restore();
});

it("SHOULD use textPrimary for an accent selected label WHEN dark", () => {
  const restore = mockDarkTheme();
  setupAccent();
  expect(
    StyleSheet.flatten(screen.getByTestId("seg-a-label").props.style).color,
  ).toBe(colors.dark.textPrimary);
  restore();
});
