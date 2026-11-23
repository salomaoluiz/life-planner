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
      },
      badges: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.xs,
      },
      header: { gap: theme.sizes.spacing.md },
      row: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.md,
        justifyContent: "space-between",
        paddingVertical: theme.sizes.spacing.sm,
      },
      rowAmounts: { alignItems: "flex-end", gap: theme.sizes.spacing.xxs },
      rowMain: { flex: 1, gap: theme.sizes.spacing.xxs },
      screen: { gap: theme.sizes.spacing.lg },
      sheetBody: { gap: theme.sizes.spacing.md },
      totals: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.md,
      },
    }),
    theme,
  };
}

export default useStyles;
