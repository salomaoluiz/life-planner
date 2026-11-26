import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      block: { flex: 1, gap: theme.sizes.spacing.sm, minWidth: 280 },
      blocks: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.md,
      },
      controls: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.md,
      },
      itemInfo: { flex: 1, gap: theme.sizes.spacing.xxs },
      itemRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        justifyContent: "space-between",
        paddingVertical: theme.sizes.spacing.xs,
      },
      monthSwitch: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xs,
      },
      screen: { gap: theme.sizes.spacing.lg },
      tile: { flexBasis: 200, flexGrow: 1, flexShrink: 1 },
      tiles: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.md,
      },
    }),
    theme,
  };
}

export default useStyles;
