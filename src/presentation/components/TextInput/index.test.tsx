import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

import { fireEvent, hasText, mockDarkTheme, screen } from "@tests";

import { TextInputMode } from "./index";
import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD pass the correct props for an Flat editable input", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual(
    expect.objectContaining({
      activeUnderlineColor: "transparent",
      children: undefined,
      mode: "flat",
      onBlur: expect.any(Function),
      onChangeText: defaultProps.onChangeText,
      onFocus: expect.any(Function),
      placeholderTextColor: "#5A6273",
      style: expect.any(Object),
      testID: "test-text-input",
      underlineColor: "transparent",
      value: "Default Value",
    }),
  );
});

it("SHOULD pass the correct props for an Outlined not editable input", () => {
  setup({ disabled: true, mode: TextInputMode.Outlined });

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual(
    expect.objectContaining({
      activeUnderlineColor: "transparent",
      children: undefined,
      disabled: true,
      mode: "flat",
      onBlur: expect.any(Function),
      onChangeText: defaultProps.onChangeText,
      onFocus: expect.any(Function),
      placeholderTextColor: "#5A6273",
      style: expect.any(Object),
      testID: "test-text-input",
      underlineColor: "transparent",
      value: "Default Value",
    }),
  );
});

it("SHOULD have the correct style", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props.style).toEqual({
    backgroundColor: "transparent",
    color: "#151922",
    minHeight: 55,
    width: "100%",
  });
});

it("SHOULD use the focused border color WHEN the input is focused and the default one WHEN blurred", () => {
  setup();
  const input = screen.getByTestId("test-text-input");
  const blur = screen.UNSAFE_getByType(BlurView);
  const idle = StyleSheet.flatten(blur.props.style);

  fireEvent(input, "focus");
  const focused = StyleSheet.flatten(
    screen.UNSAFE_getByType(BlurView).props.style,
  );
  fireEvent(input, "blur");
  const blurred = StyleSheet.flatten(
    screen.UNSAFE_getByType(BlurView).props.style,
  );

  expect(focused.borderColor).not.toBe(idle.borderColor);
  expect(blurred).toEqual(idle);
});

it("SHOULD render the label WHEN provided", () => {
  setup({ label: "Name" });

  expect(hasText("Name")).toBe(true);
});

it("SHOULD NOT render a label WHEN none is provided", () => {
  setup();

  expect(hasText("Name")).toBe(false);
});

it.each([
  [false, 40, "light"],
  [true, 20, "dark"],
])("SHOULD use the blur settings for isDark=%s", (dark, intensity, tint) => {
  const restore = dark ? mockDarkTheme() : () => undefined;

  setup();

  expect(screen.UNSAFE_getByType(BlurView).props).toMatchObject({
    intensity,
    tint,
  });
  restore();
});

it("SHOULD forward the form and keyboard props to the underlying input", () => {
  const onSubmitEditing = jest.fn();

  setup({
    autoCapitalize: "none",
    autoComplete: "email",
    error: true,
    label: "Email",
    onSubmitEditing,
    returnKeyType: "next",
    secureTextEntry: true,
    textContentType: "emailAddress",
  });

  expect(screen.getByTestId("test-text-input").props).toMatchObject({
    accessibilityLabel: "Email",
    autoCapitalize: "none",
    autoComplete: "email",
    error: true,
    onSubmitEditing,
    returnKeyType: "next",
    secureTextEntry: true,
    textContentType: "emailAddress",
  });
});

it("SHOULD pass a right icon button that calls onPress", () => {
  const onPress = jest.fn();

  setup({
    rightIcon: { accessibilityLabel: "Show password", name: "eye", onPress },
  });

  const right = screen.getByTestId("test-text-input").props.right;
  expect(right.props).toMatchObject({
    accessibilityLabel: "Show password",
    icon: "eye",
  });
  right.props.onPress();
  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT pass a right icon WHEN none is provided", () => {
  setup();

  expect(screen.getByTestId("test-text-input").props.right).toBeUndefined();
});
