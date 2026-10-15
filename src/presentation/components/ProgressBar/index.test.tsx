import { StyleSheet } from "react-native";

import { screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { setup } from "./mocks/index.mocks";

function now() {
  return screen.getByTestId("progress").props.accessibilityValue.now;
}

it("SHOULD expose the progress as an accessible percentage", () => {
  setup({ progress: 0.5 });

  expect(screen.getByTestId("progress").props.accessibilityRole).toBe(
    "progressbar",
  );
  expect(screen.getByTestId("progress").props.accessibilityLabel).toBe(
    "25% used",
  );
  expect(now()).toBe(50);
  expect(
    StyleSheet.flatten(screen.getByTestId("progress-fill").props.style).width,
  ).toBe("50%");
});

it.each([
  [2, 100],
  [-1, 0],
  [Number.NaN, 0],
])("SHOULD clamp %s to %s", (progress, expected) => {
  setup({ progress });

  expect(now()).toBe(expected);
});

it("SHOULD paint the fill with the accent by default and expense on request", () => {
  setup();
  expect(
    StyleSheet.flatten(screen.getByTestId("progress-fill").props.style)
      .backgroundColor,
  ).toBe(lightTheme.colors.accent);
});

it("SHOULD paint the fill with the expense color WHEN tone is expense", () => {
  setup({ tone: "expense" });
  expect(
    StyleSheet.flatten(screen.getByTestId("progress-fill").props.style)
      .backgroundColor,
  ).toBe(lightTheme.colors.expense);
});
