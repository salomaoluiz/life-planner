import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks/index.mocks";

function frame() {
  return screen.getByTestId("field-frame");
}
function frameStyle() {
  return StyleSheet.flatten(frame().props.style);
}
function input() {
  return screen.getByTestId("field");
}

it("SHOULD show the label above and forward typing", () => {
  setup();
  fireEvent.changeText(input(), "Ana");
  expect(screen.getByTestId("field-label").props.children).toBe("Name");
  expect(defaultProps.onChangeText).toHaveBeenCalledWith("Ana");
});

it("SHOULD link the label for screen readers", () => {
  setup();
  expect(input().props.accessibilityLabel).toBe("Name");
});

it("SHOULD use the default frame", () => {
  setup();
  expect(frameStyle()).toEqual(
    expect.objectContaining({
      backgroundColor: lightTheme.colors.surface,
      borderColor: lightTheme.colors.border,
      borderWidth: 1,
      height: lightTheme.sizes.size.inputHeight,
    }),
  );
});

it("SHOULD show accent border and focus ring WHEN focused", () => {
  setup();
  fireEvent(input(), "focus");
  expect(frameStyle().borderColor).toBe(lightTheme.colors.accent);
  expect(screen.getByTestId("focus-ring")).toBeTruthy();
  fireEvent(input(), "blur");
  expect(frameStyle().borderColor).toBe(lightTheme.colors.border);
});

it("SHOULD show the red border, message and announce it WHEN error", () => {
  setup({ error: "Required" });
  expect(frameStyle().borderColor).toBe(lightTheme.colors.expense);
  expect(screen.getByTestId("field-error").props.children).toBe("Required");
  expect(input().props.accessibilityHint).toBe("Required");
});

it("SHOULD show the helper WHEN there is no error", () => {
  setup({ helper: "Hint" });
  expect(screen.getByTestId("field-helper").props.children).toBe("Hint");
});

it("SHOULD be non-editable WHEN disabled", () => {
  setup({ disabled: true });
  expect(input().props.editable).toBe(false);
});

it("SHOULD grow between 3 and 6 lines WHEN multiline", () => {
  setup({ multiline: true });
  const style = StyleSheet.flatten(frame().props.style);
  const { lineHeight } = lightTheme.typography.input;
  const { md } = lightTheme.sizes.spacing;
  expect(style.minHeight).toBe(lineHeight * 3 + md);
  expect(style.maxHeight).toBe(lineHeight * 6 + md);
});

it("SHOULD toggle the password visibility with the caller labels", () => {
  setup({
    hidePasswordLabel: "Hide",
    secureTextEntry: true,
    showPasswordLabel: "Show",
  });
  expect(input().props.secureTextEntry).toBe(true);
  const toggle = screen.getByTestId("field-toggle");
  expect(toggle.props.accessibilityLabel).toBe("Show");

  fireEvent.press(toggle);

  expect(input().props.secureTextEntry).toBe(false);
  expect(screen.getByTestId("field-toggle").props.accessibilityLabel).toBe(
    "Hide",
  );
});

it("SHOULD forward keyboard and submit props", () => {
  const onSubmitEditing = jest.fn();
  setup({
    keyboardType: "email-address",
    maxLength: 5,
    onSubmitEditing,
    returnKeyType: "next",
  });
  fireEvent(input(), "submitEditing");
  expect(input().props.keyboardType).toBe("email-address");
  expect(input().props.maxLength).toBe(5);
  expect(onSubmitEditing).toHaveBeenCalledTimes(1);
});
