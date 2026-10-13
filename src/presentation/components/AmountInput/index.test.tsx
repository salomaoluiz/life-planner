import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { onChange, setup } from "./mocks/index.mocks";

function input() {
  return screen.getByTestId("amount");
}

it("SHOULD show the formatted value centered with display style", () => {
  setup({ value: 123 });
  expect(input().props.value).toBe("R$ 1,23");
  const style = StyleSheet.flatten(input().props.style);
  expect(style.textAlign).toBe("center");
  expect(style.fontSize).toBe(lightTheme.typography.display.fontSize);
  expect(style.fontVariant).toEqual(["tabular-nums"]);
});

it("SHOULD fill digits from the right: 1, 2, 3 -> 123 cents", () => {
  setup({ value: 0 });
  fireEvent.changeText(input(), "R$ 0,01");
  expect(onChange).toHaveBeenLastCalledWith(1);
  fireEvent.changeText(input(), "R$ 0,12");
  expect(onChange).toHaveBeenLastCalledWith(12);
  fireEvent.changeText(input(), "R$ 1,23");
  expect(onChange).toHaveBeenLastCalledWith(123);
});

it("SHOULD remove the last digit on backspace", () => {
  setup({ value: 123 });
  fireEvent.changeText(input(), "R$ 1,2");
  expect(onChange).toHaveBeenLastCalledWith(12);
});

it("SHOULD ignore non-digits, empty text and a 13th digit", () => {
  setup({ value: 0 });
  fireEvent.changeText(input(), "abc");
  expect(onChange).toHaveBeenLastCalledWith(0);
  fireEvent.changeText(input(), "");
  expect(onChange).toHaveBeenLastCalledWith(0);
  fireEvent.changeText(input(), "R$ 12345678901,23");
  expect(onChange).toHaveBeenLastCalledWith(123456789012);
});

it.each([
  ["income", "income"],
  ["expense", "expense"],
  ["neutral", "textPrimary"],
] as const)("SHOULD color the %s tone with %s", (tone, token) => {
  setup({ tone });
  expect(StyleSheet.flatten(input().props.style).color).toBe(
    lightTheme.colors[token],
  );
});

it("SHOULD show label and error", () => {
  setup({ error: "Required" });
  expect(screen.getByTestId("amount-label").props.children).toBe("Amount");
  expect(screen.getByTestId("amount-error").props.children).toBe("Required");
  expect(input().props.keyboardType).toBe("number-pad");
});
