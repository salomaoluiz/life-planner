import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      arrows: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
      arrowsCompact: { alignSelf: "stretch", gap: spacing.xs },
      blocks: { gap: spacing.md },
      center: { width: "100%" },
      content: { gap: spacing.md, paddingBottom: spacing.xxl },
      detail: { gap: spacing.xs },
      detailRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      donutWrap: { alignItems: "center", justifyContent: "center" },
      growth: { flexGrow: 1, flexShrink: 1, minWidth: 280 },
      legendRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 44,
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xxs,
      },
      legendValue: { minWidth: 96, textAlign: "right" },
      pair: { flexBasis: 420, flexGrow: 1, flexShrink: 1, minWidth: 280 },
      pairs: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
      },
      period: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      presets: { flexShrink: 1, minWidth: 280 },
      range: { flexShrink: 1, minWidth: 220, paddingHorizontal: spacing.xs },
      rangeCompact: { flex: 1, minWidth: 0 },
      rankRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 44,
        paddingVertical: spacing.xs,
      },
      rankValues: { alignItems: "flex-end", flexShrink: 0, minWidth: 120 },
      root: { flex: 1 },
      row: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        justifyContent: "space-between",
      },
      stack: { gap: spacing.xs },
      tileFive: { flexBasis: 200, flexGrow: 1, minWidth: 180 },
      tileFull: { flexBasis: "100%", flexGrow: 1 },
      tiles: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      tileTwo: { flexBasis: "45%", flexGrow: 1, minWidth: 140 },
    }),
  };
}

export default useStyles;
