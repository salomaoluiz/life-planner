import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles(compact = false) {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      actions: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      cards: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      cardWrap: {
        flexBasis: compact ? "47%" : "15%",
        flexGrow: 1,
      },
      chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
      content: { gap: spacing.lg, paddingVertical: spacing.md },
      header: {
        flexDirection: compact ? "column" : "row",
        gap: spacing.md,
        justifyContent: "space-between",
      },
      opCell: { flex: 1, minWidth: 0 },
      opCellRight: { alignItems: "flex-end", flex: 1 },
      opRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      panel: { gap: spacing.xs },
      sectionMain: { flex: compact ? undefined : 2.3, gap: spacing.xs },
      sections: {
        flexDirection: compact ? "column" : "row",
        gap: spacing.md,
      },
      sectionSide: { flex: compact ? undefined : 1, gap: spacing.xs },
      titleRow: {
        alignItems: "baseline",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      valuationRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
      },
    }),
    theme,
  };
}

export default useStyles;
