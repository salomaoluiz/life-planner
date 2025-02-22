import { StyleSheet } from "react-native";
import { useTheme } from "@presentation/theme";
import { TextMode } from "./types";

export function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    [TextMode.Display]: {
      fontSize: theme.sizes.fontSizes.xxlarge,
      lineHeight: theme.sizes.lineHeights.xxlarge,
    },
    [TextMode.Headline]: {
      fontSize: theme.sizes.fontSizes.xlarge,
      lineHeight: theme.sizes.lineHeights.xlarge,
    },
    [TextMode.Title]: {
      fontSize: theme.sizes.fontSizes.large,
      lineHeight: theme.sizes.lineHeights.large,
    },
    [TextMode.Body]: {
      fontSize: theme.sizes.fontSizes.medium,
      lineHeight: theme.sizes.lineHeights.medium,
    },
    [TextMode.Label]: {
      fontSize: theme.sizes.fontSizes.small,
      lineHeight: theme.sizes.lineHeights.small,
    },
    [TextMode.Caption]: {
      fontSize: theme.sizes.fontSizes.xsmall,
      lineHeight: theme.sizes.lineHeights.xsmall,
    },
  });
}
