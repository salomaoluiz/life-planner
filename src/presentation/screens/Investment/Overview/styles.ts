import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      allocation: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
      },
      arrows: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
      arrowsCompact: { alignSelf: "stretch", gap: spacing.xs },
      blocks: { gap: spacing.md, paddingBottom: spacing.xxl },
      dates: { gap: spacing.sm },
      detail: { gap: spacing.xxs },
      detailRow: {
        alignItems: "baseline",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      legend: { flexBasis: 240, flexGrow: 1, flexShrink: 1 },
      pair: { flexBasis: 420, flexGrow: 1, flexShrink: 1, minWidth: 280 },
      pairs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
      period: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      presets: { flexShrink: 1, minWidth: 300 },
      range: { flexShrink: 1, minWidth: 250, paddingHorizontal: spacing.xs },
      rangeCompact: { flex: 1, minWidth: 0 },
      rankingTrailing: { alignItems: "flex-end", gap: spacing.xxs },
      tile: { flexBasis: "19%", flexGrow: 1, minWidth: 180 },
      tiles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
      toolbar: { gap: spacing.sm },
    }),
  };
}

export default useStyles;
