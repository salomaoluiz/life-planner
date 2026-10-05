import { StyleSheet } from "react-native";

import { screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { contrastRatio } from "./contrast";
import { setup } from "./mocks/index.mocks";

function style() {
  return StyleSheet.flatten(screen.getByTestId("tile").props.style);
}

it("SHOULD render a 40 px tile with radius sm and neutral tone by default", () => {
  setup();
  expect(style()).toEqual(
    expect.objectContaining({
      backgroundColor: lightTheme.colors.surfaceRaised,
      borderRadius: lightTheme.sizes.borderRadius.sm,
      height: 40,
      width: 40,
    }),
  );
});

it("SHOULD render the first character of `label` instead of the icon WHEN label is given", () => {
  setup({ label: "Família", name: undefined, tone: "accent" });
  expect(screen.getByTestId("tile-label").props.children).toBe("F");
  expect(screen.queryByTestId("tile-icon")).toBeNull();
  expect(
    StyleSheet.flatten(screen.getByTestId("tile-label").props.style).color,
  ).toBe(lightTheme.colors.accentText);
});

it("SHOULD render the icon and no label WHEN only name is given", () => {
  setup();
  expect(screen.getByTestId("tile-icon")).toBeTruthy();
  expect(screen.queryByTestId("tile-label")).toBeNull();
});

it("SHOULD render 48 px WHEN lg", () => {
  setup({ size: "lg" });
  expect(style().height).toBe(48);
});

it.each([
  ["accent", "accentSoft"],
  ["income", "incomeSoft"],
  ["expense", "expenseSoft"],
  ["warning", "warningSoft"],
] as const)("SHOULD use the %s soft fill", (tone, token) => {
  setup({ tone });
  expect(style().backgroundColor).toBe(lightTheme.colors[token]);
});

it("SHOULD tint a category color at 16% and keep the icon at 3:1 against surface", () => {
  setup({ color: "#000000" });
  expect(style().backgroundColor).toBe("rgba(0,0,0,0.16)");
  const icon = screen.getByTestId("tile-icon");

  expect(
    contrastRatio(icon.props.color, lightTheme.colors.surface),
  ).toBeGreaterThanOrEqual(3);
});

it("SHOULD not crash WHEN the stored color is not hex", () => {
  setup({ color: "red" });
  expect(screen.getByTestId("tile")).toBeTruthy();
  expect(style().backgroundColor).toBe(lightTheme.colors.surfaceRaised);
});
