import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.background,
        flex: 1,
        padding: theme.sizes.spacing.medium,
      },
    }),
    theme,
  };
}

export default getStyles;
