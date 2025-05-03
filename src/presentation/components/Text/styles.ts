import { StyleSheet, TextStyle } from "react-native";

import { useTheme } from "@presentation/theme";
import { ThemeProp } from "@presentation/theme/types";

import { TextMode, TextProps } from "./types";

export function getStyles(textProps: TextProps) {
  const { theme } = useTheme();

  const defaultStyles: TextStyle = {
    color: theme.colors.onSurface,
  };

  const customStyles = getCustomStyles(theme, textProps);

  return StyleSheet.create({
    [TextMode.Body]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.small,
      lineHeight: theme.sizes.lineHeights.small,
    },
    [TextMode.Caption]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.xxsmall,
      lineHeight: theme.sizes.lineHeights.xxsmall,
    },
    [TextMode.Display]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.xxlarge,
      lineHeight: theme.sizes.lineHeights.xxlarge,
    },
    [TextMode.Headline]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.large,
      lineHeight: theme.sizes.lineHeights.large,
    },
    [TextMode.Label]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.xsmall,
      lineHeight: theme.sizes.lineHeights.xsmall,
    },
    [TextMode.Title]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: theme.sizes.fontSizes.medium,
      lineHeight: theme.sizes.lineHeights.medium,
    },
  });
}

function getCustomStyles(theme: ThemeProp, textProps: TextProps) {
  const styles = {
    color: textProps?.color,
    fontWeight: textProps?.bold ? "bold" : "normal",
    textAlign: textProps?.textAlign,
  };

  return Object.entries(styles).reduce<TextStyle>((acc, [key, value]) => {
    if (value) {
      acc = { ...acc, [key]: value };
    }
    return acc;
  }, {});
}
