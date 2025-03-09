import { StyleSheet } from "react-native";
import { useTheme } from "@presentation/theme";
import { TextMode } from "@presentation/components/Text/types";

export function getStyles() {
  const { theme } = useTheme();
  const defaultStyles = {
    color: theme.colors.onPrimary,
  };

  return StyleSheet.create({
    [TextMode.Display]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.xxlarge,
      lineHeight: theme.sizes.lineHeights.xxlarge,
    },
    [TextMode.Headline]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.xlarge,
      lineHeight: theme.sizes.lineHeights.xlarge,
    },
    [TextMode.Title]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.large,
      lineHeight: theme.sizes.lineHeights.large,
    },
    [TextMode.Body]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.medium,
      lineHeight: theme.sizes.lineHeights.medium,
    },
    [TextMode.Label]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.small,
      lineHeight: theme.sizes.lineHeights.small,
    },
    [TextMode.Caption]: {
      ...defaultStyles,
      fontSize: theme.sizes.fontSizes.xsmall,
      lineHeight: theme.sizes.lineHeights.xsmall,
    },
  });
}
