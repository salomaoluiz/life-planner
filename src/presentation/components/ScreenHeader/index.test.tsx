import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { setup, setupFull } from "./mocks/index.mocks";

it("SHOULD render only the title by default", () => {
  setup();
  expect(screen.getByTestId("header-title").props.children).toBe("Stock");
  expect(
    StyleSheet.flatten(screen.getByTestId("header-title").props.style).fontSize,
  ).toBe(lightTheme.typography.title.fontSize);
  expect(screen.queryByTestId("header-overline")).toBeNull();
  expect(screen.queryByTestId("header-subtitle")).toBeNull();
});

it("SHOULD render overline, subtitle and trailing actions", () => {
  setupFull();
  expect(screen.getByTestId("header-overline").props.children).toBe(
    "Monday, 5 October",
  );
  expect(screen.getByTestId("header-subtitle").props.children).toBe("12 items");
  expect(screen.getByText("action")).toBeTruthy();
});

it("SHOULD mark the title as a header for screen readers", () => {
  setup();
  expect(screen.getByTestId("header-title").props.accessibilityRole).toBe(
    "header",
  );
});

it("SHOULD turn the title into a labelled button WHEN onTitlePress is given", () => {
  const onTitlePress = jest.fn();
  setup({ onTitlePress, titleAccessibilityLabel: "Stock, change section" });
  const button = screen.getByTestId("header-title-button");

  expect(button.props.accessibilityRole).toBe("button");
  expect(button.props.accessibilityLabel).toBe("Stock, change section");
  fireEvent.press(button);
  expect(onTitlePress).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT render a title button WITHOUT onTitlePress", () => {
  setup();
  expect(screen.queryByTestId("header-title-button")).toBeNull();
});
