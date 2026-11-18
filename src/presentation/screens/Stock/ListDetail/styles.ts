import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      badges: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xs,
      },
      groupHeader: {
        alignItems: "baseline",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      header: { gap: theme.sizes.spacing.md },
      priceBox: {
        alignItems: "flex-end",
        gap: theme.sizes.spacing.xxs,
      },
      row: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.md,
        justifyContent: "space-between",
        paddingVertical: theme.sizes.spacing.sm,
      },
      rowAmounts: { alignItems: "flex-end", gap: theme.sizes.spacing.xxs },
      rowMain: { flex: 1, gap: theme.sizes.spacing.xxs },
      rowTrailing: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
      screen: { gap: theme.sizes.spacing.lg },
      sheetBody: { gap: theme.sizes.spacing.md },
      totals: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.md,
      },
    }),
    theme,
  };
}

export default useStyles;
