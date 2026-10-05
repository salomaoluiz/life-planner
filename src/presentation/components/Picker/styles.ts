import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.sizes.borderRadius.large,
        borderWidth: 1,
        flexGrow: 1,
        margin: 0,
        overflow: "hidden",
      },
      itemStyle: {
        fontSize: theme.sizes.fontSizes.small,
      },
      picker: {
        backgroundColor: "transparent",
        borderWidth: 0,
        color: theme.colors.textPrimary,
        height: theme.sizes.spacing.xxlarge,
      },
    }),
    theme,
  };
}

export default getStyles;
