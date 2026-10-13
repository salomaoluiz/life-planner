import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { Button } from "@components";
import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks/index.mocks";

function label() {
  return screen.getByTestId(`${defaultProps.testID}-label`);
}
function root() {
  return screen.getByTestId(defaultProps.testID);
}
function rootStyle() {
  return StyleSheet.flatten(root().props.style);
}

it("SHOULD call onPress and render the label", () => {
  setup();
  fireEvent.press(root());
  expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  expect(label().props.children).toBe("Button Label");
});

it.each([
  ["Primary", "accent", "onAccent"],
  ["Secondary", "surfaceRaised", "textPrimary"],
  ["Destructive", "expenseSoft", "expense"],
] as const)(
  "SHOULD paint %s with %s fill and %s label",
  (variant, fill, text) => {
    setup({ variant });
    expect(rootStyle().backgroundColor).toBe(lightTheme.colors[fill]);
    expect(StyleSheet.flatten(label().props.style).color).toBe(
      lightTheme.colors[text],
    );
  },
);

it("SHOULD give Secondary a 1 px border", () => {
  setup({ variant: "Secondary" });
  expect(rootStyle().borderWidth).toBe(1);
});

it("SHOULD paint the Ghost label with expense WHEN tone is expense", () => {
  setup({ tone: "expense", variant: "Ghost" });
  expect(StyleSheet.flatten(label().props.style).color).toBe(
    lightTheme.colors.expense,
  );
  expect(rootStyle().backgroundColor).toBeUndefined();
});

it("SHOULD ignore tone on Primary", () => {
  setup({ tone: "expense", variant: "Primary" });
  expect(StyleSheet.flatten(label().props.style).color).toBe(
    lightTheme.colors.onAccent,
  );
});

it("SHOULD render Ghost without fill", () => {
  setup({ variant: "Ghost" });
  expect(rootStyle().backgroundColor).toBeUndefined();
  expect(StyleSheet.flatten(label().props.style).color).toBe(
    lightTheme.colors.accentText,
  );
});

it.each([
  ["md", 48],
  ["lg", 54],
] as const)("SHOULD use height for size %s", (size, height) => {
  setup({ size });
  expect(rootStyle().height).toBe(height);
});

it("SHOULD stretch WHEN fullWidth", () => {
  setup({ fullWidth: true });
  expect(rootStyle().alignSelf).toBe("stretch");
});

it("SHOULD not press, keep the label and be busy WHEN loading", () => {
  setup({ loading: true });
  fireEvent.press(root());
  expect(defaultProps.onPress).not.toHaveBeenCalled();
  expect(root().props.accessibilityState.busy).toBe(true);
  expect(label().props.children).toBe("Button Label");
  expect(screen.getByTestId(`${defaultProps.testID}-spinner`)).toBeTruthy();
});

it("SHOULD not press WHEN disabled", () => {
  setup({ disabled: true });
  fireEvent.press(root());
  expect(defaultProps.onPress).not.toHaveBeenCalled();
});

it("SHOULD render the icon on the left WHEN given and no spinner", () => {
  setup({ icon: "plus" });
  expect(screen.getByTestId(`${defaultProps.testID}-icon`)).toBeTruthy();
  expect(screen.queryByTestId(`${defaultProps.testID}-spinner`)).toBeNull();
});

it("SHOULD keep the legacy names mapped", () => {
  expect(Button.Filled).toBe(Button.Primary);
  expect(Button.Outlined).toBe(Button.Secondary);
  expect(Button.Text).toBe(Button.Ghost);
});
