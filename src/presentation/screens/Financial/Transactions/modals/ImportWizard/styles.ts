import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

function useStyles() {
  const { spacing } = useKitTheme();

  return {
    styles: StyleSheet.create({
      blockHeaderRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        justifyContent: "space-between",
      },
      blockStack: { alignItems: "flex-start", flexDirection: "column" },
      column: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
      columnRow: { gap: spacing.xs, paddingVertical: spacing.sm },
      fileRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
      footerNote: { flexShrink: 1 },
      groupHeader: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        justifyContent: "space-between",
        paddingVertical: spacing.xs,
      },
      groupStack: {
        alignItems: "flex-start",
        flexDirection: "column",
        gap: spacing.xs,
      },
      grow: { flex: 1, gap: spacing.xxs },
      required: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.xs,
        paddingVertical: spacing.xs,
      },
      row: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
      section: { gap: spacing.xs },
      select: { flex: 1, minWidth: 140 },
      selects: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
      stack: { gap: spacing.md },
      stepBody: { flex: 1, minHeight: 0 },
      tableRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      },
      totals: {
        alignItems: "baseline",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        justifyContent: "flex-end",
      },
      totalsColumn: {
        alignItems: "baseline",
        flexDirection: "row",
        gap: spacing.xxs,
      },
      totalsStack: {
        alignItems: "flex-start",
        flexDirection: "column",
        gap: spacing.xxs,
      },
    }),
  };
}

export default useStyles;
