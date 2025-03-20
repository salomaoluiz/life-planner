import { StyleSheet, TextStyle } from "react-native";

import { TextMode } from "@presentation/components/Text/types";
import { useTheme } from "@presentation/theme";

export function getStyles() {
  const { theme } = useTheme();
  const defaultStyles: TextStyle = {
    color: theme.colors.onSurface,
  };

  return StyleSheet.create({
    [TextMode.Body]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.small,
      lineHeight: theme.sizes.lineHeights.small,
    },
    [TextMode.Caption]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.xxsmall,
      lineHeight: theme.sizes.lineHeights.xxsmall,
    },
    [TextMode.Display]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.xxlarge,
      lineHeight: theme.sizes.lineHeights.xxlarge,
    },
    [TextMode.Headline]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.large,
      lineHeight: theme.sizes.lineHeights.large,
    },
    [TextMode.Label]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.xsmall,
      lineHeight: theme.sizes.lineHeights.xsmall,
    },
    [TextMode.Title]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.medium,
      lineHeight: theme.sizes.lineHeights.medium,
    },
  });
}
