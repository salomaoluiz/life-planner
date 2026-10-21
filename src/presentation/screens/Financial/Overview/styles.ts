import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      actions: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
      blocks: { gap: spacing.md },
      center: { alignSelf: "center", maxWidth: 1200, width: "100%" },
      column: { flexBasis: 420, flexGrow: 1, flexShrink: 1 },
      content: { gap: spacing.md, paddingBottom: spacing.xxl },
      dates: { gap: spacing.sm },
      detail: { gap: spacing.xxs },
      detailRow: { flexDirection: "row", justifyContent: "space-between" },
      pair: { flexBasis: 420, flexGrow: 1, flexShrink: 1, minWidth: 280 },
      pairs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
      period: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      root: { flex: 1 },
      scopeRow: { gap: spacing.sm },
      tile: { flexBasis: 160, flexGrow: 1, flexShrink: 1 },
      tiles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
      toolbar: { gap: spacing.sm },
      twoColumns: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
    }),
  };
}

export default useStyles;
