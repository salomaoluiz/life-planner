import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      category: {
        alignItems: "center",
        gap: theme.sizes.spacing.medium,
      },
      subCategory: {
        alignItems: "center",
        gap: theme.sizes.spacing.xsmall,
      },
      container: {
        marginTop: theme.sizes.spacing.medium,
      },
    }),
    theme,
  };
}

export default getStyles;
