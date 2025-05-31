import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.sizes.borderRadius.medium,
        boxShadow: theme.colors.elevation.large,
      },
    }),
    theme,
  };
}

export default getStyles;
