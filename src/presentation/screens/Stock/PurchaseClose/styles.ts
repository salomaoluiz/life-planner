import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
        justifyContent: "flex-end",
      },
      column: { gap: theme.sizes.spacing.md },
      row: {
        gap: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.sm,
      },
      screen: { gap: theme.sizes.spacing.lg },
      totals: { gap: theme.sizes.spacing.xs },
    }),
    theme,
  };
}

export default useStyles;
