import { StyleSheet } from "react-native";

import { screen } from "@tests";

import { Text } from "@components";
import { TextMode } from "@components/Text/types";
import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks/index.mocks";

function style() {
  return StyleSheet.flatten(
    screen.getByTestId(defaultProps.testID).props.style,
  );
}

it.each([
  [TextMode.Display, "display"],
  [TextMode.Title, "title"],
  [TextMode.Heading, "heading"],
  [TextMode.Body, "body"],
  [TextMode.BodyStrong, "bodyStrong"],
  [TextMode.Caption, "caption"],
  [TextMode.Overline, "overline"],
  [TextMode.Tab, "tab"],
] as const)("SHOULD render %s with the %s scale", (mode, token) => {
  setup({ mode });

  expect(style()).toEqual(
    expect.objectContaining({
      fontSize: lightTheme.typography[token].fontSize,
      lineHeight: lightTheme.typography[token].lineHeight,
    }),
  );
  expect(screen.getByTestId(defaultProps.testID).props.children).toBe(
    "Text Label",
  );
});

it("SHOULD default to textPrimary", () => {
  setup();
  expect(style().color).toBe(lightTheme.colors.textPrimary);
});

it("SHOULD default Caption to textSecondary", () => {
  setup({ mode: TextMode.Caption });
  expect(style().color).toBe(lightTheme.colors.textSecondary);
});

it.each([
  ["accent", "accentText"],
  ["expense", "expense"],
  ["income", "income"],
  ["secondary", "textSecondary"],
  ["warning", "warning"],
] as const)("SHOULD paint tone %s with %s", (tone, token) => {
  setup({ tone });
  expect(style().color).toBe(lightTheme.colors[token]);
});

it("SHOULD uppercase the Overline", () => {
  setup({ mode: TextMode.Overline });
  expect(style().textTransform).toBe("uppercase");
});

it("SHOULD use tabular numerals WHEN tabular", () => {
  setup({ tabular: true });
  expect(style().fontVariant).toEqual(["tabular-nums"]);
});

it("SHOULD forward numberOfLines, align and live region", () => {
  setup({
    accessibilityLiveRegion: "polite",
    align: "center",
    numberOfLines: 1,
  });
  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props.numberOfLines).toBe(1);
  expect(component.props.accessibilityLiveRegion).toBe("polite");
  expect(style().textAlign).toBe("center");
});

it("SHOULD keep the deprecated props working", () => {
  setup({ bold: true, color: "#123456", textAlign: "right" });
  expect(style()).toEqual(
    expect.objectContaining({
      color: "#123456",
      fontWeight: "bold",
      textAlign: "right",
    }),
  );
});

it("SHOULD map the deprecated Headline to Heading and Label to Caption", () => {
  expect(Text.Headline).toBe(Text.Heading);
  expect(Text.Label).toBe(Text.Caption);
});
