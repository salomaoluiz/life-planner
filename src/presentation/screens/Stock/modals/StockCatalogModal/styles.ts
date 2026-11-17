import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.xs,
      },
      content: { gap: theme.sizes.spacing.md },
      row: { gap: theme.sizes.spacing.xxs },
      sectionHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
    }),
    theme,
  };
}

export default useStyles;
