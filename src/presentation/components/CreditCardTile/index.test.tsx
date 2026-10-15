import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { setup } from "./mocks/index.mocks";

it("SHOULD show brand, masked digits, title and available", () => {
  setup();

  expect(screen.getByTestId("tile-brand")).toBeTruthy();
  expect(screen.getByText("•••• 1234")).toBeTruthy();
  expect(screen.getByTestId("tile-title").props.children).toBe("Main card");
  expect(screen.getByText("Available")).toBeTruthy();
  expect(screen.getByText("R$ 5.000,00")).toBeTruthy();
});

it("SHOULD hide the digits WHEN there are none", () => {
  setup({ lastDigits: undefined });

  expect(screen.queryByTestId("tile-digits")).toBeNull();
});

it("SHOULD expose the accessibility label AND call onPress", () => {
  const { onPress } = setup();

  expect(screen.getByTestId("tile").props.accessibilityLabel).toBe(
    "Main card, Visa, available R$ 5.000,00",
  );
  fireEvent.press(screen.getByTestId("tile"));
  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD tint the background AND outline the tile with the tint only when selected", () => {
  setup({ selected: true });
  const selected = StyleSheet.flatten(screen.getByTestId("tile").props.style);

  expect(selected.backgroundColor).toBe("#6366F129");
  expect(selected.borderColor).toBe("#6366F1");
  expect(screen.getByTestId("tile").props.accessibilityState.selected).toBe(
    true,
  );
});

it("SHOULD use the neutral border WHEN not selected", () => {
  setup();

  expect(
    StyleSheet.flatten(screen.getByTestId("tile").props.style).borderColor,
  ).toBe(lightTheme.colors.border);
});
