import { StyleSheet, TextStyle } from "react-native";

import { useTheme } from "@presentation/theme";

import { TextMode, TextProps } from "./types";

export function getStyles(textProps: TextProps) {
  const { theme } = useTheme();

  const defaultStyles: TextStyle = {
    color: theme.colors.onSurface,
  };

  const customStyles = getCustomStyles(textProps);

  return StyleSheet.create({
    [TextMode.Body]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.small,
      letterSpacing: 0.15,
      lineHeight: theme.sizes.lineHeights.small,
    },
    [TextMode.Caption]: {
      ...defaultStyles,
      ...customStyles,
      color: textProps?.color ?? theme.colors.onSurfaceVariant,
      fontSize: theme.sizes.fontSizes.xxsmall,
      letterSpacing: 0.4,
      lineHeight: theme.sizes.lineHeights.xxsmall,
    },
    [TextMode.Display]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.xxlarge,
      fontWeight: "300",
      letterSpacing: -0.5,
      lineHeight: theme.sizes.lineHeights.xxlarge,
    },
    [TextMode.Headline]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.large,
      fontWeight: "600",
      letterSpacing: 0,
      lineHeight: theme.sizes.lineHeights.large,
    },
    [TextMode.Label]: {
      ...defaultStyles,
      ...customStyles,
      color: textProps?.color ?? theme.colors.onSurfaceVariant,
      fontSize: theme.sizes.fontSizes.xsmall,
      fontWeight: "500",
      letterSpacing: 0.5,
      lineHeight: theme.sizes.lineHeights.xsmall,
    },
    [TextMode.Title]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.medium,
      fontWeight: "600",
      letterSpacing: 0.1,
      lineHeight: theme.sizes.lineHeights.medium,
    },
  });
}

function getCustomStyles(textProps: TextProps) {
  const styles = {
    color: textProps?.color,
    fontWeight: textProps?.bold ? "bold" : undefined,
    textAlign: textProps?.textAlign,
  };

  return Object.entries(styles).reduce<TextStyle>((acc, [key, value]) => {
    if (value) {
      acc = { ...acc, [key]: value };
    }
    return acc;
  }, {});
}
