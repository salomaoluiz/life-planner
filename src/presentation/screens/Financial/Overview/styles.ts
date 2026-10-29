import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      actions: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
      blocks: { gap: spacing.md },
      center: { width: "100%" },
      content: { gap: spacing.md, paddingBottom: spacing.xxl },
      dates: { gap: spacing.sm },
      detail: { gap: spacing.xxs },
      // Label and value side by side (not at the two ends), so they stay associated on wide screens
      detailRow: {
        alignItems: "baseline",
        flexDirection: "row",
        gap: spacing.sm,
      },
      pair: { flexBasis: 420, flexGrow: 1, flexShrink: 1, minWidth: 280 },
      pairs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
      period: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      presets: { flexShrink: 1, minWidth: 300 },
      root: { flex: 1 },
      scopeRow: { gap: spacing.sm },
      tileFour: { flexBasis: "24%", flexGrow: 1, minWidth: 200 },
      tiles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
      tileTwo: { flexBasis: "48%", flexGrow: 1, minWidth: 200 },
      toolbar: { gap: spacing.sm },
    }),
  };
}

export default useStyles;
