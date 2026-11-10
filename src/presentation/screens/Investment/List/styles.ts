import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      cardLine: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      cardTop: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      cell: { flex: 1, minWidth: 0 },
      cellAsset: { flex: 2.4, gap: spacing.xxs, minWidth: 0 },
      cellNumber: { alignItems: "flex-end", flex: 1.2, gap: spacing.xxs },
      cellNumberWide: { alignItems: "flex-end", flex: 1.5, gap: spacing.xxs },
      footnote: { paddingVertical: spacing.md },
      header: { gap: spacing.md },
      headerRow: {
        flexDirection: "row",
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      },
      noResults: {
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.xl,
      },
      row: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      tickerRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.xs,
      },
    }),
    theme,
  };
}

export default useStyles;
