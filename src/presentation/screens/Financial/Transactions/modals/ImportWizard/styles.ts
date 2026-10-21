import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

function useStyles() {
  const { spacing } = useKitTheme();

  return {
    styles: StyleSheet.create({
      column: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
      columnRow: { gap: spacing.xs, paddingVertical: spacing.sm },
      fileRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
      footerNote: { flexShrink: 1 },
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
      tableRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      },
    }),
  };
}

export default useStyles;
