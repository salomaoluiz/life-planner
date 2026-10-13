import { StyleSheet } from "react-native";

import { screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { setup } from "./mocks/index.mocks";

function label() {
  return StyleSheet.flatten(screen.getByTestId("badge-label").props.style);
}

function root() {
  return StyleSheet.flatten(screen.getByTestId("badge").props.style);
}

it("SHOULD render a neutral pill by default", () => {
  setup();
  expect(screen.getByTestId("badge-label").props.children).toBe("Expired");
  expect(root().backgroundColor).toBe(lightTheme.colors.surfaceRaised);
  expect(root().borderRadius).toBe(lightTheme.sizes.borderRadius.full);
  expect(label().color).toBe(lightTheme.colors.textSecondary);
});

it.each([
  ["accent", "accentSoft", "accentText"],
  ["income", "incomeSoft", "income"],
  ["expense", "expenseSoft", "expense"],
  ["warning", "warningSoft", "warning"],
] as const)("SHOULD paint tone %s", (tone, bg, fg) => {
  setup({ tone });
  expect(root().backgroundColor).toBe(lightTheme.colors[bg]);
  expect(label().color).toBe(lightTheme.colors[fg]);
});

it("SHOULD use the caption size with bold weight", () => {
  setup();
  expect(label().fontSize).toBe(lightTheme.typography.caption.fontSize);
  expect(label().fontWeight).toBe(lightTheme.typography.heading.fontWeight);
});
