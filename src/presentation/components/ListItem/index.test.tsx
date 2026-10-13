import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import {
  onLongPress,
  onPress,
  setup,
  setupWithSlots,
} from "./mocks/index.mocks";

it("SHOULD render title, subtitle, leading and trailing", () => {
  setupWithSlots();
  expect(screen.getByTestId("item-title").props.children).toBe("Milk");
  expect(screen.getByTestId("item-subtitle").props.children).toBe("1 L");
  expect(screen.getByText("lead")).toBeTruthy();
  expect(screen.getByText("trail")).toBeTruthy();
});

it("SHOULD truncate title and subtitle to a single line", () => {
  setupWithSlots();
  expect(screen.getByTestId("item-title").props.numberOfLines).toBe(1);
  expect(screen.getByTestId("item-subtitle").props.numberOfLines).toBe(1);
});

it("SHOULD be a plain row without role WHEN it has no handlers", () => {
  setup();
  expect(screen.getByTestId("item").props.accessibilityRole).toBeUndefined();
});

it("SHOULD be pressable with 56 px min height WHEN onPress or onLongPress", () => {
  setup({ onLongPress, onPress });
  const item = screen.getByTestId("item");
  fireEvent.press(item);
  fireEvent(item, "longPress");
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onLongPress).toHaveBeenCalledTimes(1);
  expect(item.props.accessibilityRole).toBe("button");
  expect(StyleSheet.flatten(item.props.style).minHeight).toBe(56);
  expect(StyleSheet.flatten(item.props.style).paddingVertical).toBe(
    lightTheme.sizes.spacing.sm,
  );
});

it("SHOULD render an inset divider WHEN divider", () => {
  setup({ divider: true });
  expect(screen.getByTestId("item-divider")).toBeTruthy();
});

it("SHOULD not render a divider by default", () => {
  setup();
  expect(screen.queryByTestId("item-divider")).toBeNull();
});

it("SHOULD keep an empty title without crashing", () => {
  setup({ title: "" });
  expect(screen.getByTestId("item-title").props.children).toBe("");
});
